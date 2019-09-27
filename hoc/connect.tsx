import React from "react"
import { Actions } from 'relite'
import GlobalContext from "../context"
import { State, Handlers } from "../type"

export interface Props {
  state: State
  handlers: Handlers
  actions: {}
  [x: string]: any
}

export interface Selector {
  <R extends object>(props: Props): R
}

export interface Connect {
  <S extends (...args: any[]) => any = () => null>(selector?: S): With<ReturnType<S>>
}

type ExcludeFromObject<T, E> = Pick<T, Exclude<keyof T, keyof E>>

export interface With<EP extends object> {
  <P extends object>(inputComponent: React.ComponentType<P>): (props: ExcludeFromObject<P, EP>) => React.ReactElement
}

const connect: Connect = <S extends (...args: any[]) => any>(selector?: S) => (
  InputComponent
) => {
  return function Connector(props) {
    return (
      <GlobalContext.Consumer>
        {({ state, handlers, actions }) => {
            let sProps = selector ? selector({ state, handlers, actions, props }) : {}

          return (
            <InputComponent
              {...props}
              {...sProps}
            />
          )
        }}
      </GlobalContext.Consumer>
    )
  }
}

export default  connect