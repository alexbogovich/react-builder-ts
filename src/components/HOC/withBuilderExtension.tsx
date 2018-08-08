import React, { CSSProperties, MouseEvent } from 'react'
import BuilderMenu from '../Builder/BuilderMenu/BuilderMenu'
import { InlineStyleAware } from '../../common/Builder'

interface IWithBuilderExtension extends InlineStyleAware {
    settings?: object
    styleConfig?: boolean
}

interface IWithBuilderExtensionState<T> {
    open: boolean,
    selectedValue?: string,
    overriddenStyle?: CSSProperties
    overriddenProps?: T
}

const withBuilderExtension = <P extends InlineStyleAware>(WrappedComponent: React.ComponentType<P>) =>
    class WithBuilderExtension extends React.Component<P & IWithBuilderExtension, IWithBuilderExtensionState<P>> {

        state = {
            open: false,
            selectedValue: undefined,
            overriddenStyle: undefined
        }

        handleClickOpen = () => {
            this.setState({ open: true })
        }

        handleClose = (value?: string) => {
            console.log('handle close')
            this.setState({ selectedValue: value, open: false })
        }

        onInlineStyleJson = (json: string) => {
            console.log(json)
            try {
                const parsedStyle = JSON.parse(json) as CSSProperties
                this.setState({ overriddenStyle: parsedStyle })
            } catch (e) {
                console.debug(e)
            }
        }

        onPropsChangeViaBuilder = (newProps: P) => {
            this.setState({ overriddenProps: newProps })
        }

        public render() {
            const { settings, style, styleConfig, ...props } = this.props as IWithBuilderExtension
            const { overriddenStyle, overriddenProps } = this.state as IWithBuilderExtensionState<P>

            let inlineStyle = style
            if (overriddenStyle) {
                inlineStyle = {
                    ...inlineStyle,
                    ...overriddenStyle
                }
            }

            console.log(overriddenProps)

            // noinspection TsLint
            const processedProps = { ...props, style: inlineStyle } as P
            Object.assign(processedProps, overriddenProps)
            Object.assign(processedProps, { children: this.props.children })
            console.log(processedProps)
            return (
                <>
                    <div onClick={this.wrapperHandler}>
                        <BuilderMenu<P>
                            open={this.state.open}
                            onClose={this.handleClose}
                            selectedValue={this.state.selectedValue}
                            onStyleChangeHandler={styleConfig ? this.onInlineStyleJson : undefined}
                            onPropsUpdate={this.onPropsChangeViaBuilder}
                            buildElementProps={processedProps}/>
                        <WrappedComponent {...processedProps}/>
                    </div>
                </>
            )
        }

        private wrapperHandler = (event: MouseEvent<HTMLElement>) => {
            event.stopPropagation()
            if (!this.state.open) {
                this.handleClickOpen()
            }
            console.info('wrapperHandler')
        }
    }

export default withBuilderExtension
