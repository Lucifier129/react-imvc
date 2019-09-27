import React from 'react'
import { Actions, StateFromAS } from 'relite'
import GlobalContext from '../context'
import ControllerProxy from './ControllerProxy'
import Controller from '../controller'

interface Props<S extends object, AS extends Actions<S & StateFromAS<AS>>> {
	controller: Controller<S, AS, any>
}

export default class ViewManager<S extends object, AS extends Actions<S & StateFromAS<AS>>> extends React.Component<Props<S, AS>> {
	static ignoreErrors = true
	views: Record<string, any> = {}
	scrollMap: Record<string, any> = {}
	constructor(props: Props<S, AS>, context: React.Context<any>) {
		super(props, context)
		this.addItemIfNeed(props.controller.location.raw)
	}

	addItemIfNeed(key: string) {
		if (!this.views.hasOwnProperty(key)) {
			this.views[key] = null
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

	componentWillReceiveProps(nextProps: Props<S, AS>) {
		let currentPath = this.props.controller.location.raw
		let nextPath = nextProps.controller.location.raw
		if (currentPath !== nextPath) {
			this.scrollMap[currentPath] = window.scrollY
		}
		this.addItemIfNeed(nextPath)
		this.clearItemIfNeed()
	}

	renderView(path: string) {
		let { controller } = this.props
		let {
			View,
			store,
			handlers,
			location,
			history,
			context,
			matcher,
			loader,
			prefetch,
			handleInputChange,
			meta
		} = controller
		let currentPath = controller.location.raw

		if (currentPath !== path) {
			return this.views[path]
		}

		let state = store.getState()
		let actions = store.actions
		let globalContext = {
			ctrl: controller,
			location,
			history,
			state,
			actions,
			preload: context.preload,
			handleInputChange,
			handlers,
			matcher,
			loader,
			prefetch
		}

		let view = (
			<GlobalContext.Provider value={globalContext as any}>
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

	render() {
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
	static ignoreErrors = true
	container: HTMLElement | string | null = null

	getContainer = (container: HTMLElement | string | null) => {
		this.container = container
	}

	getResetScrollOnMount = () => {
		let { resetScrollOnMount } = this.props
		return resetScrollOnMount === undefined ? true : !!resetScrollOnMount
	}

	shouldComponentUpdate(nextProps: ItemProps) {
		if (!nextProps.isActive) {
			(this.container as HTMLElement).style.display = 'none'
		} else {
			if (!this.props.isActive) {
				(this.container as HTMLElement).style.display = ''
				window.scroll(0, this.props.scrollY)
			}
		}
		return nextProps.isActive
	}

	componentDidMount() {
		if (this.getResetScrollOnMount()) {
			window.scroll(0, 0)
		}
	}
	
	render() {
		return (
			<div className="imvc-view-item" ref={this.getContainer}>
				{this.props.view}
			</div>
		)
	}
}