import React from 'react'
import GlobalContext from '../context'

const returnNull = () => null
export default (selector = returnNull) =>
    (InputComponent) => {
        return function Connector(props) {
            return (
                <GlobalContext.Consumer>
                    {({ state, handlers, actions }) => {
                        return <InputComponent {...props} {...selector({ state, handlers, actions, props })} />
                    }}
                </GlobalContext.Consumer>
            )
        }
    }
