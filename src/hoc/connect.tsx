import React from "react"
import GlobalContext from "../context"
import { BaseState, Handlers } from ".."

export interface Props {
  state: BaseState
  handlers: Handlers
  actions: {}
  [x: string]: any
}

export type ExcludeFromObject<T, E> = Pick<T, Exclude<keyof T, keyof E>>

export function connect<S extends (...args: any[]) => any>(
  selector?: S
): <P extends object>(
  InputComponent: React.ComponentType<P>
) => (
  props: ExcludeFromObject<P, ReturnType<S>>
) => React.ReactElement {
  return function<P extends object>(
    InputComponent: React.ComponentType<P>
  ): (
    props: ExcludeFromObject<P, ReturnType<S>>
  ) => React.ReactElement {
    return function Connector(
      props: ExcludeFromObject<P, ReturnType<S>>
    ): React.ReactElement  {
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
}
