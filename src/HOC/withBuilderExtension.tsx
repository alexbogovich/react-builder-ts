import * as React from 'react'
import { getDisplayName } from 'recompose'
import BuilderMenu from '../components/Builder/BuilderMenu/BuilderMenu'
import { objectToReactComponent } from '../utils/MappingConverter/MappingConverter'
import { BehaviorSubject, combineLatest, EMPTY, Observable, Subject } from 'rxjs'
import { distinctUntilChanged, map, scan, switchMap, tap } from 'rxjs/operators'
import { isEqual } from 'underscore'
// import { isArray } from 'rxjs/internal-compatibility'

interface IWithBuilderExtensionProps {
    subject$: Subject<any>,
    settings: any,
    children?: IOverriddenProps | IOverriddenProps[]
    type: string | IBuilderModule
    [x: string]: any
}

export interface IBuilderModule {
    module: string,
    name?: string,
    defaultImport?: boolean
}

export interface IOverriddenProps {
    children?: IOverriddenProps | IOverriddenProps[]
    props?: {
        [x: string]: any
    },
    type: string | IBuilderModule
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

interface IChildSubscriptionWithProps {
    child$: Subject<IOverriddenProps> | Array<Subject<IOverriddenProps>>,
    overriddenProps: IOverriddenProps
}

interface IInternalSubscription {
    overriddenProps: IOverriddenProps
    child$: Subject<any> | Array<Subject<any>>
    latestChildProps: string | IOverriddenProps | IOverriddenProps[]
}

function mapObjectToOverriddenProps(obj): IOverriddenProps {
    console.debug('[MAP_CHILD_OBJECT]', obj)
    const { props, type, children, ...restProps } = obj
    return {
        type,
        children,
        props: {
            ...props,
            ...restProps
        }
    }
}

function createDistinctSubject(value: IOverriddenProps) {
    return new BehaviorSubject<IOverriddenProps>(value).pipe(
        distinctUntilChanged((x, y) => isEqual(x, y))
    )
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

        scanPropsChanges = (prev: IChildSubscriptionWithProps, props: IOverriddenProps): IChildSubscriptionWithProps => {
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
                const prevLength = (Array.isArray(prev$) && prev$.length) || 0
                if (prevLength === children.length) {
                    console.debug('[CHILDREN_CHANGED_SCAN] same size')
                    children.forEach((v, i) => prev$[i].next(v))
                    child$ = prev$
                } else if (prevLength > children.length) {
                    console.debug('[CHILDREN_CHANGED_SCAN] new is lower')
                    child$ = Array.isArray(prev$) && prev$.slice(0, children.length) || []
                    children.forEach((v, i) => child$[i].next(v))
                } else if (prevLength < children.length) {
                    console.debug('[CHILDREN_CHANGED_SCAN] new is longer')
                    child$ = Array.isArray(prev$) && [...prev$] || []
                    children.forEach(
                        (v, i) =>
                            i < prevLength
                                ? child$[i].next(v)
                                : child$.push(createDistinctSubject(v))
                    )
                }
            } else if (children) {
                console.debug('[CHILDREN_CHANGED_SCAN] is object')
                child$ = prev$ || createDistinctSubject(children)
                child$.next(children)
            }
            return { child$, overriddenProps: props }
        }

        switchToLatestSubscriptionOfChild = (propsWithChild$: IChildSubscriptionWithProps): Observable<IInternalSubscription> => {
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
        }

        onInternalChangesSubscription = (externalSubject$: Subject<IOverriddenProps>) => (state: IInternalSubscription) => {
            console.debug('[INNER_SUBJECT_SWITCH$] receive', state)
            const { overriddenProps, child$, latestChildProps } = state
            let children
            if (typeof latestChildProps === 'string') {
                children = latestChildProps
            } else {
                children = Array.isArray(latestChildProps)
                    ? latestChildProps.map(v => mapObjectToOverriddenProps(v))
                    : mapObjectToOverriddenProps(latestChildProps)
            }

            const innerPropsSub = {
                ...overriddenProps,
                children
            }
            console.debug('[INNER_SUBJECT_SWITCH$] set', innerPropsSub)
            this.setState({ overriddenProps: innerPropsSub, child$ })
            // TODO: notify with delay. Probably use debounce with some key which can determinate is is source of changes or not
            console.debug('[INNER_SUBJECT_SWITCH$] notify parent', innerPropsSub)
            externalSubject$.next(innerPropsSub)
        }

        componentDidMount() {
            const { settings, subject$, ...props } = this.props
            console.debug('[COMPONENT_DID_MOUNT] props is', props)
            console.debug('[COMPONENT_DID_MOUNT] subject$ is', subject$)
            if (!subject$) {
                console.warn('[COMPONENT_DID_MOUNT] component dont receive  subject$')
            }

            const innerProps = mapObjectToOverriddenProps(props)
            const externalSubject$ = subject$ || createDistinctSubject(innerProps)
            const innerSubject$ = new BehaviorSubject<IOverriddenProps>(innerProps)

            innerSubject$.pipe(
                tap(v => console.debug('[INNER_SUBJECT_$] receive', v)),
                distinctUntilChanged(),
                scan(this.scanPropsChanges, undefined),
                tap(v => console.debug('[INNER_SUBJECT_$] init', v)),
                switchMap(this.switchToLatestSubscriptionOfChild),
                tap(v => console.debug('[INNER_SUBJECT_PIPE$] latest slice outer', v))
            ).subscribe(this.onInternalChangesSubscription(externalSubject$))

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
            console.debug('[COMPONENT_DID_UPDATE] props', this.props)
            console.debug('[COMPONENT_DID_UPDATE] prevProps', prevProps)
            console.debug('[COMPONENT_DID_UPDATE] state', this.state)
            if (!isEqual(prevProps, this.props)) {
                const { settings, subject$, ...props } = this.props
                const transformedProps = mapObjectToOverriddenProps(props)
                if (isEqual(this.state.overriddenProps, transformedProps)) return
                console.debug('[COMPONENT_DID_UPDATE] props dont match')
                this.emitUpdateIfValueChanged(transformedProps)
            }
        }

        render() {
            const { overriddenProps, child$ } = this.state
            console.debug('[RENDER] props', this.props)
            console.debug('[RENDER] overriddenProps', overriddenProps)
            const wrappedComponentProps = {
                ...overriddenProps,
                ...(overriddenProps && overriddenProps.props || undefined),
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
