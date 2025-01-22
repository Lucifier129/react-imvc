import React from 'react'

/**
 * ViewProxy 把 react 组件生命周期同步到 controller 里
 * 根据 state 更新 document.title
 */
export default class ControllerProxy extends React.Component {
    static ignoreErrors = true
    updateDocumentTitle() {
        let { controller } = this.props
        let { html } = controller.store.getState()

        if (html && html.title !== document.title) {
            document.title = html.title
        }
    }
    async emit(method) {
        let { controller } = this.props
        try {
            if (typeof controller[method] === 'function') {
                await controller[method]()
            }
        } catch (error) {
            if (controller.errorDidCatch) {
                controller.errorDidCatch(error, 'controller')
            } else {
                throw error
            }
        }
    }
    componentDidMount() {
        let { controller } = this.props
        this.updateDocumentTitle()
        if (!controller.meta.hadMounted) {
            controller.meta.hadMounted = true
            this.emit('componentDidFirstMount')
        }
        this.emit('componentDidMount')
    }
    componentWillUnmount() {
        this.emit('componentWillUnmount')
    }
    componentDidUpdate() {
        this.updateDocumentTitle()
    }
    render() {
        return null
    }
}
