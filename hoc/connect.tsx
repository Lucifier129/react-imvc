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
  (props: Props): any
}

export interface Connect {
  (selector: Selector): With
}

export interface With {
  <P>(inputComponent: React.ComponentType<P>): (props: P) => React.ReactElement
}


const returnNull: Selector = () => null

const connect: Connect = (selector = returnNull) => (
  InputComponent
) => {
  return function Connector(props) {
    return (
      <GlobalContext.Consumer>
        {({ state, handlers, actions }) => {
          return (
            <InputComponent
              {...props}
              {...selector({ state, handlers, actions, props })}
            />
          )
        }}
      </GlobalContext.Consumer>
    )
  }
}
export default  connect