import React from "react"
import GlobalContext from "../context"
import IMVC from "../index"



const returnNull: IMVC.Selector = () => null

const connect: IMVC.Connect = (selector = returnNull) => (
  InputComponent
) => {
  return function Connector(props) {
    return (
      <GlobalContext.Consumer>
        {({ state, handlers, actions }: IMVC.ConnectProps) => {
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