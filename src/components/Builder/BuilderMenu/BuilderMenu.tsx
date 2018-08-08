import { Dialog, DialogTitle, TextField } from '@material-ui/core'
import React from 'react'
import { InlineStyleAware } from '../../../common/Builder'

export interface ISimpleDialog<T> {
    onClose: (value?: string) => void,
    selectedValue?: string,
    open: boolean,
    onStyleChangeHandler?: (styleJson: string) => void
    buildElementProps: T,
    onPropsUpdate: (props: T) => void
}

export interface ISimpleDialogState {
    elementProps: string
}

class SimpleDialog<T extends InlineStyleAware> extends React.Component<ISimpleDialog<T>, ISimpleDialogState> {

    state = {
        elementProps: ''
    }

    componentDidMount() {
        console.log(this.props)
        const { buildElementProps } = this.props
        if (buildElementProps) {
            this.setState({ elementProps: JSON.stringify(buildElementProps, (k, v) => k !== 'children' ? v : null, 2) })
        }
    }

    closeHandler = () => {
        console.log('closeHandler')
        this.props.onClose(this.props.selectedValue)
    }

    styleInputHandler = event => {
        if (this.props.onStyleChangeHandler) {
            this.props.onStyleChangeHandler(event.target.value)
        }
    }

    propsInputHandler = event => {
        const value = event.target.value
        try {
            const props = JSON.parse(value)
            console.log(props)
            this.props.onPropsUpdate(props)
        } catch (e) {
            console.error(e)
        }
        this.setState({ elementProps: value })
    }

    render() {
        console.log(this.props)
        const { onClose, selectedValue, open, onStyleChangeHandler, buildElementProps, ...other } = this.props

        let styleValue = JSON.stringify({})
        if (buildElementProps && buildElementProps.style) {
            styleValue = JSON.stringify(buildElementProps.style, null, 2)
            // propsValue = JSON.stringify(buildElementProps, null, 2)
        }

        return (
            <Dialog onClose={this.closeHandler} aria-labelledby="simple-dialog-title" open={open} {...other}>
                <DialogTitle id="simple-dialog-title">Awesome builder menu</DialogTitle>
                <div>
                    { onStyleChangeHandler &&
                        <TextField label="CSS JSON" onChange={this.styleInputHandler} multiline fullWidth rows={4} rowsMax={10} value={styleValue}/>
                    }
                    <TextField label="PROPS JSON" onChange={this.propsInputHandler} multiline fullWidth rows={20} rowsMax={40} value={this.state.elementProps}/>
                </div>
            </Dialog>
        )
    }
}

// export default withStyles(styles)(BuilderMenu)
export default SimpleDialog
