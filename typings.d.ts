
interface IOverriddenProps {
    children?: IOverriddenProps | IOverriddenProps[]
    props: any,
    type: any
}

declare module '*.builder.json' {
    const value: IOverriddenProps
    export default value
}
