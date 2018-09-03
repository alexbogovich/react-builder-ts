import { Observable, Subject } from 'rxjs'

export interface IBuilderModule {
  module: string,
  name?: string,
  defaultImport?: boolean
}

export interface IBuilderProps {
  children?: IBuilderProps | IBuilderProps[]
  props?: {
    [x: string]: any
  },
  type: string | IBuilderModule
}

export type OneChild$ = {
  child$?: Subject<IBuilderProps>
}

export type ManyChild$ = {
  child$?: Array<Subject<IBuilderProps>>
}

export type OneChildSlice$ = {
  latestChildSubscription$?: Observable<IBuilderProps>
}

export type ManyChildSlice$ = {
  latestChildSubscription$?: Observable<IBuilderProps[]>
}

export type IChildSubscriptionWithProps = {
  overriddenProps: IBuilderProps
} & (OneChild$ | ManyChild$)

export type OneChildProps = {
  latestChildProps?: string | IBuilderProps
}

export type ManyChildProps = {
  latestChildProps?: IBuilderProps[]
}
