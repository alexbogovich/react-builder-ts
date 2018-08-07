import React, { Component, MouseEvent } from 'react'

class NestedDivTree extends Component {

    onRedHandler = (event: MouseEvent<HTMLElement>) => {
        event.stopPropagation()
        console.log('red')
    }
    onGreenHandler = (event: MouseEvent<HTMLElement>) => {
        event.stopPropagation()
        console.log('green')
    }
    onBlueHandler = (event: MouseEvent<HTMLElement>) => {
        event.stopPropagation()
        console.log('blue')
    }

    render() {
        return (
            <div style={{ width: '100px', height: '100px', backgroundColor: 'red' }} onClick={this.onRedHandler}>
                <div style={{ width: '60px', height: '60px', backgroundColor: 'green' }} onClick={this.onGreenHandler}>
                    <div style={{ width: '30px', height: '30px', backgroundColor: 'blue' }} onClick={this.onBlueHandler}/>
                </div>
            </div>
        )
    }
}

export default NestedDivTree
