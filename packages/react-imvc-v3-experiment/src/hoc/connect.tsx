import React from 'react'
import GlobalContext from '../context'

export type ExcludeFromObject<T, E> = Pick<T, Exclude<keyof T, keyof E>>

export interface With<EP extends object> {
  <P extends object>(inputComponent: React.ComponentType<P>): (
    props: ExcludeFromObject<P, EP>
  ) => React.ReactElement
}

function connect<S extends (props: any) => any>(
  selector?: S
): With<ReturnType<S>> {
  return <P extends object>(InputComponent: React.ComponentType<P>) => {
    return function Connector(props) {
      return (
        <GlobalContext.Consumer>
          {({ state, ctrl }) => {
            let sProps = selector ? selector({ state, ctrl, props }) : {}

            return <InputComponent {...props} {...sProps} />
          }}
        </GlobalContext.Consumer>
      )
    }
  }
}

export default connect
