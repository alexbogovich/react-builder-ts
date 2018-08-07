import React, { Component } from 'react'
import withBuilderExtension from '../HOC/withBuilderExtension'
import { InlineStyleAware } from '../../common/Builder/InlineStyleAware'

class SuperCube extends Component<InlineStyleAware> {
    render() {
        console.log('Super cube props', this.props)
        const { children, ...props } = this.props

        return (
            <div {...props}>
                { children ? children : null }
            </div>
        )
    }
}

export default withBuilderExtension(SuperCube)
