import React from 'react'
import GlobalContext from '../context'

type Props = {
	src?:string
}

export default class Prefetch extends React.Component<Props> {
	static contextType:React.Context<any> = GlobalContext
	componentDidMount():void {
		this.context.prefetch(this.props.src)
	}
	render():React.ReactNode {
		return null
	}
}
