import { getObjectFromModule } from '../ObjectLoader/ObjectLoader'
import { componentFromProp, defaultProps, mapPropsStream, pure } from 'recompose'
import { from, Subject } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import withBuilderExtension from '../../HOC/withBuilderExtension'
import * as React from 'react'
import { IBuilderProps } from '../../HOC/withBuilderExtension.model'

export function isComplexType(type) {
  return !!type && !!type.module
}

export async function processType(type) {
  return isComplexType(type)
    ? getObjectFromModule(type.module, type.name, type.defaultImport)
    : type
}

export async function processChildren(children) {
  return Array.isArray(children)
    ? Promise.all(children.map(async v => transformPropsToReactAsync(v)))
    : transformPropsToReactAsync(children)
}

export async function transformPropsToReactAsync(componentJson): Promise<object | string> {
  if (typeof componentJson === 'string') return componentJson
  const type = processType(componentJson.type)
  return {
    ...componentJson,
    children: componentJson.children
      ? await processChildren(componentJson.children)
      : undefined,
    type: await type
  }
}

export const propsStreamToReactComponents = mapPropsStream(props$ =>
  from(props$).pipe(switchMap(transformPropsToReactAsync))
)

export const setDefaultTypeToDiv = defaultProps({ type: 'div' })

export const getComponentByPropType = componentFromProp('type')

export const ComponentWithBuilder: React.ComponentType<any> = pure(
  withBuilderExtension(
    propsStreamToReactComponents(setDefaultTypeToDiv(getComponentByPropType))
  )
)

export const processedJsonToReact = (
  obj: (IBuilderProps | string | undefined),
  subject$?: Subject<any>, index?: number
): React.ReactNode =>
  obj && typeof obj !== 'string'
  && <ComponentWithBuilder type={obj.type} key={index} {...obj.props} children={obj.children} subject$={subject$}/>
  || obj

export const objectToReactComponent = (obj?: IBuilderProps, child$?: Subject<IBuilderProps>) =>
  obj && processedJsonToReact(obj, child$)

export const arrayToReactComponents = (obj?: IBuilderProps[], child$?: Array<Subject<IBuilderProps>>) =>
  obj && obj.map((v, i) => processedJsonToReact(v, child$ && child$[i], i))
