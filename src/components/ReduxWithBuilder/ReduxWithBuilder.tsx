import React, { Component } from 'react'
import { connect } from 'react-redux'

class ReduxWithBuilder extends Component<{}> {
    render() {
        return (
            <div>
                <div/>
            </div>
        )
    }
}

export default connect()(ReduxWithBuilder)
