import React from 'react'

const identity = x => x
const connect = (selector=identity) => InputComponent => {
	return class Connector extends React.PureComponent {
		static contextTypes = {
			state: React.PropTypes.object,
			handlers: React.PropTypes.object,
			actions: React.PropTypes.object,
		}
		constructor(props, context) {
			super(props, context)
			this.state = {...selector(context)}
		}
		componentWillReceiveProps(nextProps, nextContext) {
			this.setState({...selector(nextContext)})
		}
		render() {
			return <InputComponent {...this.state} {...this.props} />
		}
	}
}

export default connect