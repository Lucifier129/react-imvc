import React from 'react'
import GlobalContext from '../context'

export interface Props {
	src: string
}

export default class Prefetch extends React.Component<Props> {
	static contextType = GlobalContext

	componentDidMount() {
		this.context.prefetch(this.props.src)
	}
	
	render() {
		return null
	}
}
