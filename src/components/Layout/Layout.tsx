import * as React from 'react'
import { Route, Switch } from 'react-router'
import { processedJsonToReact } from '../../utils/MappingConverter/MappingConverter'
import BasicTwoCol from '../../json/BasicTwoCol.builder.json'

export default () => (
  <div style={{ flexGrow: 1 }}>
    <Switch>
      {/*<Route path="/superGridFromJson" render={gridAsJson} />*/}
      {/*<Route path="/superGridFromJsonWithLazy" render={gridAsJsonWithLoading} />*/}
      {/*<Route path="/LanguagesList" component={LanguagesList} />*/}
      <Route path="/BasicTwoCol" component={basicTwoCol} />
      {/*<Route path="/BasicTwoColOriginal" component={BasicTwoColOriginal} />*/}
      {/*<Route path="/MediaControlCard" component={MediaControlCard} />*/}
      {/*<Route path="/RaiseStateSample" component={NestSample} />*/}
    </Switch>
  </div>
)

const basicTwoCol = () => processedJsonToReact(BasicTwoCol)
