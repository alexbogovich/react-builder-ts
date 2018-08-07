import * as React from 'react'
import { InlineStyleAware } from '../../common/Builder/InlineStyleAware'

export interface IRichTextBox extends InlineStyleAware {
    testBoolean: boolean
    testString: string
}

export class RichTextBox extends React.Component<IRichTextBox> {
    public render() {
        return (
            <div>
                <p>Hello mazafacka</p>
            </div>
        )
    }
}

// export default withBuilderExtension(RichTextBox)
export default RichTextBox
