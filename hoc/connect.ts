import React from 'react'
import GlobalContext from '../context'

interface Props {
  state: object, handlers: object, actions: object
}

const returnNull: (...args: any[]) => any = () => null
export default (selector = returnNull) => (InputComponent: React.ComponentType) => {
	return function Connector(props: object) {
    const child = ({ state = {}, handlers = {}, actions = {} }: Props) => {
      return React.createElement(InputComponent, { ...props, ...selector({ state, handlers, actions, props })})
    }
		return React.createElement(GlobalContext.Consumer, null, child)
	}
}
