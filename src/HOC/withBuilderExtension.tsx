import * as React from 'react'
// import  from 'react'
import { getDisplayName } from 'recompose'
import BuilderMenu from '../components/Builder/BuilderMenu/BuilderMenu'
import { objectToReactComponent } from '../utils/MappingConverter/MappingConverter'
import { BehaviorSubject, combineLatest, EMPTY, Observable, Subject } from 'rxjs'
import { distinctUntilChanged, map, scan, switchMap, tap } from 'rxjs/operators'
import { isEqual } from 'underscore'

interface IWithBuilderExtensionProps {
    subject$: Subject<any>,
    // child$: Subject<any> | Array<Subject<any>>
    settings: any,

    [x: string]: any
}

export interface IOverriddenProps {
    children?: IOverriddenProps | IOverriddenProps[]
    props: any,
    type: any
}

interface IWithBuilderExtensionState {
    open: boolean,
    subject$?: Subject<any>,
    child$?: Subject<any> | Array<Subject<any>>,
    latestChildSubscription$?: Observable<any>,
    childrenChanged$?: Observable<any>
    overriddenProps?: IOverriddenProps
    innerSubject$?: Subject<any>
}

const withBuilderExtension = WrappedComponent =>
    class WithBuilderExtension extends React.PureComponent<IWithBuilderExtensionProps, IWithBuilderExtensionState> {
        static displayName = `HOC(${getDisplayName(WrappedComponent)})`

        state: IWithBuilderExtensionState = {
            open: false
        }

        closeBuilderMenuHandler = () => this.setState({ open: false })

        onPropsChangeViaBuilder = newProps => {
            console.debug('[RECEIVE_BUILDER_PROPS]', newProps)
            this.emitUpdateIfValueChanged(newProps)
        }

        openBuilderMenuHandler = event => {
            event.stopPropagation()
            if (!this.state.open) {
                this.setState({ open: true })
            }
        }

        mapChildObject = child => {
            console.debug('[MAP_CHILD_OBJECT]', child)
            const { props, type, children, ...restProps } = child
            return {
                type,
                children,
                props: {
                    ...props,
                    ...restProps
                }
            }
        }

        createDistinctSubject = v =>
            new BehaviorSubject(v).pipe(distinctUntilChanged((x, y) => isEqual(x, y)))

        scanPropsChanges = (prev, props) => {
            console.debug('[CHILDREN_CHANGED_SCAN] process', props, prev)
            const children = (props && props.children) || undefined
            const prev$ = (prev && prev.child$) || undefined
            const prevChildren =
                (prev && prev.overriddenProps && prev.overriddenProps.children) ||
                undefined

            if (isEqual(prevChildren, children)) {
                console.debug('[CHILDREN_CHANGED_SCAN] children same')
                return { child$: prev$, overriddenProps: props }
            }
            let child$
            if (Array.isArray(children)) {
                console.debug('[CHILDREN_CHANGED_SCAN] is array')
                const prevLength = (prev$ && prev$.length) || 0
                if (prevLength === children.length) {
                    console.debug('[CHILDREN_CHANGED_SCAN] same size')
                    children.forEach((v, i) => prev$[i].next(v))
                    child$ = prev$
                } else if (prevLength > children.length) {
                    console.debug('[CHILDREN_CHANGED_SCAN] new is lower')
                    child$ = prev$.slice(0, children.length)
                    children.forEach((v, i) => child$[i].next(v))
                } else if (prevLength < children.length) {
                    console.debug('[CHILDREN_CHANGED_SCAN] new is longer')
                    child$ = (prev$ && [...prev$]) || []
                    children.forEach(
                        (v, i) =>
                            i < prevLength
                                ? child$[i].next(v)
                                : child$.push(this.createDistinctSubject(v))
                    )
                }
            } else if (children) {
                console.debug('[CHILDREN_CHANGED_SCAN] is object')
                child$ = prev$ || this.createDistinctSubject(children)
                child$.next(children)
            }
            return { child$, overriddenProps: props }
        }

        componentDidMount() {
            const { settings, subject$, ...props } = this.props
            console.debug('[COMPONENT_DID_MOUNT] props is', props)
            console.debug('[COMPONENT_DID_MOUNT] subject$ is', subject$)
            if (!subject$) {
                console.warn('[COMPONENT_DID_MOUNT] component dont receive  subject$')
            }
            const externalSubject$ = subject$ || this.createDistinctSubject(props)
            const innerSubject$ = new BehaviorSubject<any>(props)

            innerSubject$.pipe(
                tap(v => console.debug('[INNER_SUBJECT_$] receive', v)),
                distinctUntilChanged(),
                scan(this.scanPropsChanges, undefined),
                tap(v => console.debug('[INNER_SUBJECT_$] init', v)),
                switchMap(propsWithChild$ => {
                    console.debug('[INNER_SUBJECT_PIPE$] before switch', propsWithChild$)
                    const { overriddenProps, child$ } = propsWithChild$
                    console.debug('[INNER_SUBJECT_PIPE$] child$ is ', child$)
                    const latest$ = Array.isArray(child$)
                        ? combineLatest(...child$)
                        : child$
                    if (!latest$) return EMPTY

                    return latest$.pipe(
                        tap(v =>
                            console.debug('[INNER_SUBJECT_PIPE$] latest slice in switch', v)
                        ),
                        distinctUntilChanged(),
                        map(latestChildProps => ({
                            overriddenProps,
                            child$,
                            latestChildProps
                        }))
                    )
                }),
                tap(v => console.debug('[INNER_SUBJECT_PIPE$] latest slice outer', v))
            ).subscribe((state: {overriddenProps: any, child$: any, latestChildProps: any}) => {
                console.debug('[INNER_SUBJECT_SWITCH$] receive', state)
                const { overriddenProps = {}, child$, latestChildProps } = state
                let children
                if (typeof latestChildProps === 'string') {
                    children = latestChildProps
                } else {
                    children = Array.isArray(latestChildProps)
                        ? latestChildProps.map(v => this.mapChildObject(v))
                        : this.mapChildObject(latestChildProps)
                }

                const innerProps = {
                    ...overriddenProps,
                    ...overriddenProps.props,
                    children
                }
                console.debug('[INNER_SUBJECT_SWITCH$] set', innerProps)
                this.setState({ overriddenProps: innerProps, child$ })
                // TODO: notify with delay. Probably use debounce with some key which can determinate is is source of changes or not
                console.debug('[INNER_SUBJECT_SWITCH$] notify parent', innerProps)
                externalSubject$.next(innerProps)
            })

            externalSubject$.subscribe(v => {
                console.debug('[CDM OWN SUBJECT]', v)
            })

            this.setState({ innerSubject$, subject$: externalSubject$ })
        }

        emitUpdateIfValueChanged(newValue) {
            console.debug('[EMIT_UPDATE_IF_VALUE_CHANGED]', newValue)
            if (this.state.innerSubject$) {
                this.state.innerSubject$.next(newValue)
            }
        }

        componentDidUpdate(prevProps) {
            console.debug('[COMPONENT_DID_UPDATE] props', prevProps, this.props)
            console.debug(
                '[COMPONENT_DID_UPDATE] overriddenProps',
                this.state.overriddenProps,
                this.props
            )
            if (
                !isEqual(prevProps, this.props) &&
                !isEqual(this.state.overriddenProps, this.props)
            ) {
                console.debug('[COMPONENT_DID_UPDATE] props dont match')
                this.emitUpdateIfValueChanged(this.props)
            }
        }

        render() {
            const { overriddenProps, child$ } = this.state
            console.debug('[RENDER]', overriddenProps, this.props)
            const wrappedComponentProps = {
                ...overriddenProps,
                // ...overriddenProps.props,
                children: overriddenProps && objectToReactComponent(overriddenProps.children, child$) || undefined
            }

            return (
                <React.Fragment>
                    <BuilderMenu
                        open={this.state.open}
                        onClose={this.closeBuilderMenuHandler}
                        // selectedValue={this.state.selectedValue}
                        onPropsUpdate={this.onPropsChangeViaBuilder}
                        buildElementProps={overriddenProps}
                    />
                    <WrappedComponent
                        onDoubleClick={this.openBuilderMenuHandler}
                        {...wrappedComponentProps}
                    />
                </React.Fragment>
            )
        }
    }

export default withBuilderExtension
