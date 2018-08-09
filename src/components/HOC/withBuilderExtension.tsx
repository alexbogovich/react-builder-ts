import React, { CSSProperties, MouseEvent } from 'react'
import BuilderMenu from '../Builder/BuilderMenu/BuilderMenu'
import { InlineStyleAware } from '../../common/Builder'

interface IWithBuilderExtension extends InlineStyleAware {
    settings?: object
    styleConfig?: boolean
}

interface IWithBuilderExtensionState<T extends InlineStyleAware> {
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

        componentDidMount() {
            console.log('wrappedObj:', WrappedComponent)
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
                const parsedStyle: CSSProperties = JSON.parse(json)
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
            const processedProps = Object.assign({ ...props, style: inlineStyle }, overriddenProps, { children: this.props.children })
            return (
                <>
                    <div onDoubleClick={this.wrapperHandler}>
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
