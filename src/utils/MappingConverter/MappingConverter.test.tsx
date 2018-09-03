import { Grid } from '@material-ui/core'
import { isComplexType, processType, transformPropsToReactAsync } from './MappingConverter'

const nestedElements = {
  type: {
    module: '@material-ui/core',
    name: 'Grid'
  },
  props: {
    container: true,
    spacing: 24
  },
  children: [
    {
      type: {
        module: '@material-ui/core',
        name: 'Grid'
      },
      props: {
        item: true,
        md: 12
      },
      children: {
        type: 'p',
        children: 'hello'
      }
    }
  ]
}

const nestedElementsExpected = {
  type: Grid,
  props: {
    container: true,
    spacing: 24
  },
  children: [
    {
      type: Grid,
      props: {
        item: true,
        md: 12
      },
      children: {
        type: 'p',
        children: 'hello'
      }
    }
  ]
}

describe('it should return type', () => {
  it('from component as description', () => {
    expect(
      isComplexType({
        module: '@material-ui/core',
        name: 'Grid'
      })
    ).toEqual(true)
  })

  it('from component as object', () => {
    expect(isComplexType(Grid)).toEqual(false)
  })

  it('it should get component Grid by type description', async () => {
    await expect(
      processType({
        module: '@material-ui/core',
        name: 'Grid'
      })
    ).resolves.toEqual(Grid)
  })

  it('it should ignore simple type', async () => {
    await expect(processType('div')).resolves.toEqual('div')
  })

  it('it should get return correct nested struct', async () => {
    await expect(transformPropsToReactAsync(nestedElements)).resolves.toEqual(
      nestedElementsExpected
    )
  })
})
