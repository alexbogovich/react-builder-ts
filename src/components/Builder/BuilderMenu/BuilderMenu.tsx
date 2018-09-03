import { Dialog, DialogTitle, TextField } from '@material-ui/core'
import * as React from 'react'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { isEqual } from 'underscore'

const propsToJSONReplacer = (k, v) =>
  typeof v === 'function' || k === 'subject$' ? null : v

interface ISimpleDialogProps {
  onClose: (any?: any) => any
  onPropsUpdate: (any?: any) => any
  open: boolean,
  buildElementProps: any
}

interface ISimpleDialogState {
  elementProps: string
  subject$: Subject<any>
}

class SimpleDialog extends React.PureComponent<ISimpleDialogProps, ISimpleDialogState> {
  state = {
    elementProps: '',
    subject$: new Subject()
  }

  closeHandler = () => {
    this.props.onClose()
  }

  propsInputHandler = event => {
    const value = event.target.value
    try {
      const props = JSON.parse(value)
      this.state.subject$.next(props)
    } catch (e) {
      console.error(e)
    }
    this.setState({ elementProps: value })
  }

  setElementProps = () => {
    const { buildElementProps } = this.props
    if (buildElementProps) {
      console.log('[BUILDER_DIALOG_SET_ELEMENT_PROPS]', buildElementProps)
      this.setState({
        elementProps: JSON.stringify(buildElementProps, propsToJSONReplacer, 2)
      })
    }
  }

  componentDidUpdate(prevProps) {
    const { open, buildElementProps } = this.props
    if (open && prevProps.buildElementProps !== buildElementProps) {
      this.setElementProps()
    }
  }

  componentDidMount() {
    this.state.subject$
      .pipe(
        debounceTime(500),
        distinctUntilChanged((x, y) => isEqual(x, y))
      )
      .subscribe(p => this.props.onPropsUpdate(p))
  }

  render() {
    const { open } = this.props

    return (
      <Dialog
        onClose={this.closeHandler}
        onEnter={this.setElementProps}
        aria-labelledby="simple-dialog-title"
        open={open}>
        <DialogTitle id="simple-dialog-title">Awesome builder menu</DialogTitle>
        <div>
          <TextField
            label="PROPS JSON"
            onChange={this.propsInputHandler}
            multiline
            fullWidth
            rows={20}
            rowsMax={40}
            value={this.state.elementProps}
          />
        </div>
      </Dialog>
    )
  }
}

export default SimpleDialog
