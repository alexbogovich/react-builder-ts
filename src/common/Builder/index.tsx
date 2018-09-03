import { CSSProperties } from 'react'

export interface InlineStyleAware extends Object {
  style?: CSSProperties
}

export interface ITextAware {
  text: string
}
