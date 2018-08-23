import { getObjectFromModule } from '../ObjectLoader/ObjectLoader'
import { componentFromProp, defaultProps, mapPropsStream, pure } from 'recompose'
import { from } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import withBuilderExtension, { IOverriddenProps } from '../../HOC/withBuilderExtension'
import * as React from 'react'

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

export async function transformPropsToReactAsync(componentJson) {
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

export const ComponentWithBuilder = pure(
    withBuilderExtension(
        propsStreamToReactComponents(setDefaultTypeToDiv(getComponentByPropType))
    )
)

export const processedJsonToReact = (obj: (IOverriddenProps | undefined), subject$?, index?: number) =>
    (obj &&
        obj.type && (
            <ComponentWithBuilder
                type={obj.type}
                {...obj.props}
                children={obj.children}
                subject$={subject$}
                key={index}
            />
        )) ||
    obj

export const objectToReactComponent = (obj: (IOverriddenProps | IOverriddenProps[] | undefined), child$) => {
    if (Array.isArray(obj)) {
        return obj.map((v, i) => processedJsonToReact(v, child$ && child$[i], i))
    } else {
        return processedJsonToReact(obj, child$)
    }
}
