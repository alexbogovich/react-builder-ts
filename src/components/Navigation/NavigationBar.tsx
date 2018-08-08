import React, { Component } from 'react'
import { AppBar, Button, Toolbar } from '@material-ui/core'
import { Link } from 'react-router-dom'

class NavigationBar extends Component<{}> {
    render() {
        return (
            <AppBar position="static" color="default">
                <Toolbar>
                    <Link to="/superCard">
                        <Button>
                            Super Card
                        </Button>
                    </Link>
                    <Link to="/superCube">
                        <Button>
                            Super Cube
                        </Button>
                    </Link>
                </Toolbar>
            </AppBar>
        )
    }
}

export default NavigationBar
