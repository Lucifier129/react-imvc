import React from "react"
import GlobalContext from "../context"
import { BaseState, Handlers } from ".."

export interface Props {
  state: BaseState
  handlers: Handlers
  actions: {}
  [x: string]: any
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
        {({ state, ctrl }) => {
            let sProps = selector ? selector({ state, ctrl, props }) : {}

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