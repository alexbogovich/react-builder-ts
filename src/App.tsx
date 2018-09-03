import * as React from 'react'
import './App.css'

import Layout from './components/Layout/Layout'
import NavigationBar from './components/Navigation/NavigationBar'

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <header>
          <NavigationBar/>
        </header>
        <main>
          <Layout/>
        </main>
      </div>
    )
  }
}

export default App
