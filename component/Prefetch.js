import React, { PropTypes } from 'react'

export default class Prefetch extends React.Component {
	static contextTypes = {
		prefetch: PropTypes.func
	}
	componentDidMount() {
		this.context.prefetch(this.props.src)
	}
	render() {
		return null
	}
}
