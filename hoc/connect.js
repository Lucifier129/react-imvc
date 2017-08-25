import React from 'react'

const returnNull = () => null
const connect = (selector=returnNull) => InputComponent => {
	return class Connector extends React.PureComponent {
		static contextTypes = {
			state: React.PropTypes.object,
			handlers: React.PropTypes.object,
			actions: React.PropTypes.object,
		}
		constructor(props, context) {
			super(props, context)
			this.state = {...selector({...context, props})}
		}
		componentWillReceiveProps(nextProps, nextContext) {
			this.setState({...selector({...nextContext, props: nextProps })})
		}
		render() {
			return <InputComponent {...this.state} {...this.props} />
		}
	}
}

export default connect