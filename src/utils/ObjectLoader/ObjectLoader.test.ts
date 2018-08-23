import { getObjectFromModule } from './ObjectLoader'
import { Grid } from '@material-ui/core'
import { connect } from 'react-redux'
import { compose } from 'redux'
// import SuperCube from '../../components/SuperCube/SuperCube'

describe('it should extract object', () => {
  it('@material-ui/core Grid', async () => {
    await expect(
      getObjectFromModule('@material-ui/core', 'Grid')
    ).resolves.toEqual(Grid)
  })

  it('react-redux connect', async () => {
    await expect(
      getObjectFromModule('react-redux', 'connect')
    ).resolves.toEqual(connect)
  })

  it('redux compose', async () => {
    await expect(getObjectFromModule('redux', 'compose')).resolves.toEqual(
      compose
    )
  })

  // it('SuperCube/SuperCube as default', async () => {
  //   await expect(
  //     getObjectFromModule('SuperCube/SuperCube', undefined, true)
  //   ).resolves.toEqual(SuperCube)
  // })
})
