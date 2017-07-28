import React, { Component } from 'react'

export default function createViewWrapper(controller) {
	/**
	 * ViewWrapper 把 react 组件生命周期同步到 controller 里
	 * 根据 state 更新 document.title
	 */
	return class ViewWrapper extends Component {
		componentWillMount() {
			if (controller.componentWillMount) {
				controller.componentWillMount()
			}
		}
		updateDocumentTitle() {
			let { html } = controller.store.getState()

			if (!html) {
				return
			}
			let {
				title
			} = html
			if (title && title !== document.title) {
				document.title = title
			}
		}
		componentDidMount() {
			if (controller.componentDidMount) {
				controller.componentDidMount()
			}
			if (controller.context.isClient) {
				this.updateDocumentTitle()
			}
		}
		componentWillUpdate(...args) {
			if (controller.componentWillUpdate) {
				controller.componentWillUpdate(...args)
			}
		}
		componentDidUpdate(...args) {
			if (controller.componentDidUpdate) {
				controller.componentDidUpdate(...args)
			}
			if (controller.context.isClient) {
				this.updateDocumentTitle()
			}
		}
		shouldComponentUpdate(...args) {
			if (controller.shouldComponentUpdate) {
				let result = controller.shouldComponentUpdate(...args)
				return result === false ? false : true
			}
			return true
		}
		componentWillUnmount() {
			if (controller.componentWillUnmount) {
				controller.componentWillUnmount()
			}
		}
		render() {
			let {
				View
			} = controller
			return <View {...this.props} />
		}
	}
}
