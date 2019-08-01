import React from 'react'
import GlobalContext from '../context'
import { Handlers } from '../controller/types'

const isHandler:{ (key:string):boolean } = key => /^on[A-Z]+/.test(key)

type Props = {
	as?: keyof HTMLElementTagNameMap
}

export default class EventWrapper extends React.Component<Props> {
	static contextType:React.Context<any> = GlobalContext
	static defaultProps:Props = {
		as: 'div'
	}
	render():React.ReactNode {
		const { children, as, ...props } = this.props 
		const { handlers } = this.context as { handlers: Handlers }
		for (let key in props) {
			if (isHandler(key)) {
				const handler = handlers[props[key]]
				if ('function' === typeof handler) {
					props[key] = handler
				}
			}
		}
		return React.createElement(
			as,
			props,
			children
		  )
	}
}
