import React from 'react'
import GlobalContext from '../context'
import ControllerProxy from './ControllerProxy'
import Controller from '../controller'

type Props = {
	controller: Controller
}

export default class ViewManager extends React.Component<Props> {
	static ignoreErrors:boolean = true
 	views: { [propName: string]: any } = {}
	scrollMap: { [propName: string]: any } = {}
	constructor(props: Props, context: React.Context<any>) {
		super(props, context)
		this.addItemIfNeed(props.controller.location.raw)
	}
	addItemIfNeed(key: string):void {
		if (!this.views.hasOwnProperty(key)) {
			this.views[key] = null
		}
	}
	clearItemIfNeed():void {
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
	componentWillReceiveProps(nextProps: Props):void {
		let currentPath = this.props.controller.location.raw
		let nextPath = nextProps.controller.location.raw
		if (currentPath !== nextPath) {
			this.scrollMap[currentPath] = window.scrollY
		}
		this.addItemIfNeed(nextPath)
		this.clearItemIfNeed()
	}
	renderView(path: string):JSX.Element {
		let { controller } = this.props
		let currentPath:string = controller.location.raw

		if (currentPath !== path) {
			return this.views[path]
		}

		let { meta, store, handlers, View } = controller
		let state = store.getState()
		let actions = store.actions

		let view = (
			<GlobalContext.Provider value={getContextByController(controller)}>
				<View
					key={`${meta.id}_${currentPath}`}
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
	}
	render():React.ReactNode {
		let { controller } = this.props
		return (
			<React.Fragment>
				{Object.keys(this.views).map(path => {
					return (
						<ViewItem
							key={path}
							path={path}
							isActive={path === controller.location.raw}
							view={this.renderView(path)}
							scrollY={this.scrollMap[path]}
							resetScrollOnMount={controller.resetScrollOnMount}
						/>
					)
				})}
				<ControllerProxy
					key={controller.meta.id + controller.location.raw}
					controller={controller}
				/>
			</React.Fragment>
		)
	}
}

type ItemProps = {
	key?: string
	path?: string
	isActive: boolean
	view?: JSX.Element
	scrollY: number
	resetScrollOnMount?: boolean
}

class ViewItem extends React.Component<ItemProps> {
	static ignoreErrors:boolean = true
	container: any
	getContainer = (container: any):void => {
		this.container = container
	}
	getResetScrollOnMount = ():boolean => {
		let { resetScrollOnMount } = this.props
		return resetScrollOnMount == undefined ? true : !!resetScrollOnMount
	}
	shouldComponentUpdate(nextProps: ItemProps):boolean {
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
	componentDidMount():void {
		if (this.getResetScrollOnMount()) {
			window.scroll(0, 0)
		}
	}
	render():React.ReactNode {
		return (
			<div className="imvc-view-item" ref={this.getContainer}>
				{this.props.view}
			</div>
		)
	}
}

function getContextByController(ctrl: Controller) {
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
		ctrl,
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
