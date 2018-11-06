import React from 'react'

export default class ViewManager extends React.Component {
	views = {}
	scrollMap = {}
	constructor(props, context) {
		super(props, context)
		this.addItemIfNeed(props)
	}
	addItemIfNeed(props) {
		let path = props.state.location.raw
		if (!this.views.hasOwnProperty(path)) {
			this.views[path] = null
		}
	}
	clearItemIfNeed() {
		let { views, scrollMap } = this
		let { controller } = this.props
		let cache = controller.getAllCache()

		for (let key in views) {
			if (!cache.hasOwnProperty(key)) {
				delete views[key]
			}
		}

		for (let key in scrollMap) {
			if (!cache.hasOwnProperty(key)) {
				delete scrollMap[key]
			}
		}
	}
	componentWillReceiveProps(nextProps) {
		if (this.props.state.location !== nextProps.state.location) {
			this.scrollMap[this.props.state.location.raw] = window.scrollY
		}
		this.addItemIfNeed(nextProps)
	}
	componentDidUpdate() {
		this.clearItemIfNeed()
	}
	renderView(path) {
		let { View, state, handlers, actions, controller, currentKey } = this.props
		let isActive = state.location.raw === path

		if (isActive) {
			let view = (
				<View
					key={currentKey}
					state={state}
					handlers={handlers}
					actions={actions}
				/>
			)
			if (controller.KeepAlive) {
				this.views[path] = view
			} else if (this.views.hasOwnProperty(path)) {
				delete this.views[path]
			}
			return view
		} else {
			return this.views[path]
		}
	}
	render() {
		let { state } = this.props
		return (
			<React.Fragment>
				{Object.keys(this.views).map(path => {
					return (
						<ViewItem
							key={path}
							path={path}
							isActive={path === state.location.raw}
							view={this.renderView(path)}
							scrollY={this.scrollMap[path]}
						/>
					)
				})}
			</React.Fragment>
		)
	}
}

class ViewItem extends React.Component {
	getContainer = container => {
		this.container = container
	}
	shouldComponentUpdate(nextProps) {
		if (!nextProps.isActive) {
			this.container.style.display = 'none'
		} else {
			if (!this.props.isActive) {
				this.container.style.display = ''
				window.scroll(0, this.props.scrollY)
			}
		}
		return nextProps.isActive
	}
	componentDidMount() {
		window.scroll(0, 0)
	}
	render() {
		return (
			<div
				className="imvc-view-item"
				ref={this.getContainer}
				data-path={this.props.path}
			>
				{this.props.view}
			</div>
		)
	}
}
