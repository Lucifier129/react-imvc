import React from 'react'
import Controller from '../controller'
import { Actions, StateFromAS } from 'relite'

export interface Props<S extends object, AS extends Actions<S & StateFromAS<AS>>> {
  controller: Controller<S, AS, any>
}

/**
 * ViewProxy 把 react 组件生命周期同步到 controller 里
 * 根据 state 更新 document.title
 */
export default class ControllerProxy<S extends object, AS extends Actions<S & StateFromAS<AS>>> extends React.Component<Props<S, AS>> {
  static ignoreErrors: boolean = true

  updateDocumentTitle() {
    let { controller } = this.props
    let { html } = controller.store.getState()

    if (html && html.title !== document.title) {
      document.title = html.title
    }
  }

  emit(method: string) {
    let { controller } = this.props
    try {
      if (typeof controller[method] === 'function') {
        controller[method]()
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
