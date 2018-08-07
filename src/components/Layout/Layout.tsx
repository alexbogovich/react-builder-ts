import * as React from 'react'
import { Route, Switch } from 'react-router'
import SuperCube from '../SuperCube/SuperCube'
import SuperCard from '../SuperCard/SuperCard'

const nyaCat = 'https://i.kym-cdn.com/entries/icons/mobile/000/005/608/nyan-cat-01-625x450.jpg'

export default () => (
    <div>
        <Switch>
            {/*<Route exact path="/" render={root}/>*/}
            {/*<Route path="/test" render={test}/>*/}
            {/*<Route path="/rtb" render={rtb}/>*/}
            {/*<Route path="/styled" render={styled}/>*/}
            {/*<Route path="/tree" render={tree}/>*/}
            <Route path="/superCube" render={superCube}/>
            <Route path="/superCard" render={superCard}/>
        </Switch>
    </div>
)

// const test = () => (<p>Test</p>)
// const root = () => (<p>Root</p>)
// const rtb = () => (<RichTextBox testBoolean testString="hello" settings={{ name: '' }}/>)
// const styled = () => (<SimpleMediaType/>)
// const tree = () => (<NestedDivTree/>)

const superCube = () => (
    <SuperCube style={{ backgroundColor: 'yellow', width: '200px', height: '200px' }} styleConfig>
        <SuperCube style={{ backgroundColor: 'red', width: '100px', height: '100px' }} styleConfig>
            <SuperCube style={{ backgroundColor: 'blue', width: '60px', height: '60px' }} styleConfig/>
        </SuperCube>
    </SuperCube>
)

const superCard = () => (
    <SuperCard style={{ maxWidth: '400px' }}
               img={{ title: 'cat', image: nyaCat, style: { height: 0, paddingTop: '56.25%' } }}
               textContent={[{ component: 'p', text: 'super cat' }]}
               actions={[{ text: 'like', color: 'primary' }]}/>
)
