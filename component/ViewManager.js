import React from 'react'
import GlobalContext from '../context'

export default class ViewManager extends React.Component {
	views = {}
	scrollMap = {}
	constructor(props, context) {
		super(props, context)
		this.addItemIfNeed(props)
	}
	addItemIfNeed(props) {
		if (!this.views.hasOwnProperty(props.currentKey)) {
			this.views[props.currentKey] = null
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
		if (this.props.currentKey !== nextProps.currentKey) {
			this.scrollMap[this.props.currentKey] = window.scrollY
		}
		this.addItemIfNeed(nextProps)
	}
	componentDidUpdate() {
		this.clearItemIfNeed()
	}
	renderView(path) {
		let { controller, currentKey } = this.props
		let isActive = currentKey === path

		if (isActive) {
			let { store, handlers, View } = controller
			let state = store.getState()
			let actions = store.actions
			let view = (
				<GlobalContext.Provider value={getContextByController(controller)}>
					<View
						key={currentKey}
						state={state}
						handlers={handlers}
						actions={actions}
					/>
				</GlobalContext.Provider>
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
		let { currentKey } = this.props
		return (
			<React.Fragment>
				{Object.keys(this.views).map(path => {
					return (
						<ViewItem
							key={path}
							path={path}
							isActive={path === currentKey}
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
			<div className="imvc-view-item" ref={this.getContainer}>
				{this.props.view}
			</div>
		)
	}
}

function getContextByController(ctrl) {
	let {
		store,
		handlers,
		location,
		history,
		context,
		matcher,
		loader,
		prefetch,
		handleInputChange
	} = ctrl
	let state = store.getState()
	return {
		location,
		history,
		state,
		actions: store.actions,
		preload: context.preload,
		handleInputChange,
		handlers,
		matcher,
		loader,
		prefetch
	}
}
