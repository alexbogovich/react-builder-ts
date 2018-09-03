import * as React from 'react'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import { Tab, Tabs } from '@material-ui/core'
import { NavLink } from 'react-router-dom'

const styles = {
  root: {
    flexGrow: 1
  }
}

const navigationBar = props => {
  const { classes } = props
  return (
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <Tabs value={'hello'}>
          <NavLink to="/BasicTwoCol">
            <Tab
              label="superGridFromJson"
            />
          </NavLink>

          {/*<Tab*/}
          {/*label="superGridFromJsonWithLazy"*/}
          {/*component={Link}*/}
          {/*to="/superGridFromJsonWithLazy"*/}
          {/*/>*/}
          {/*<Tab label="Languages List" component={Link} to="/LanguagesList" />*/}
          {/*<Tab label="Basic two col" component={Link} to="/BasicTwoCol" />*/}
          {/*<Tab*/}
          {/*label="BasicTwoColOriginal"*/}
          {/*component={Link}*/}
          {/*to="/BasicTwoColOriginal"*/}
          {/*/>*/}
          {/*<Tab*/}
          {/*label="MediaControlCard"*/}
          {/*component={Link}*/}
          {/*to="/MediaControlCard"*/}
          {/*/>*/}
          {/*<Tab*/}
          {/*label="RaiseStateSample"*/}
          {/*component={Link}*/}
          {/*to="/RaiseStateSample"*/}
          {/*/>*/}
        </Tabs>
      </AppBar>
    </div>
  )
}

// navigationBar.propTypes = {
//   classes: PropTypes.object.isRequired
// }

export default withStyles(styles)(navigationBar)
