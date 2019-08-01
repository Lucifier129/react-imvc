import React from 'react'
import GlobalContext from '../context'
import { State, Actions, Handlers, Location } from '../controller/types'

export interface ConnectProps {
  state: State,
  handlers: Actions,
  actions: Handlers
}

export type ComponentProps = {
  isActive: { (...args: any[]): boolean }
  location: Location
  className: string
  activeClassName: string
  style: object
  activeStyle: object
  to: string
}

const returnNull: (...args: any[]) => any = () => null
export default (selector = returnNull) => (InputComponent: React.ComponentType<ComponentProps>) => {
	return function Connector(props: object) {
    const child = ({ state = {}, handlers = {}, actions = {} }: ConnectProps) => {
      return React.createElement(InputComponent, { ...props, ...selector({ state, handlers, actions, props })})
    }
		return React.createElement(GlobalContext.Consumer, null, child)
	}
}