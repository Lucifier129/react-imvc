import React from 'react'
import Controller from '../controller'
import type { Actions } from 'relite'
import type { BaseState } from '..'

export interface ControllerProxyProps<
  S extends object,
  AS extends Actions<S & BaseState>
> {
  controller: Controller<S, AS>
}

/**
 * ViewProxy 把 react 组件生命周期同步到 controller 里
 * 根据 state 更新 document.title
 */
export default class ControllerProxy<
  S extends object,
  AS extends Actions<S & BaseState>
> extends React.Component<ControllerProxyProps<S, AS>> {
  static ignoreErrors: boolean = true

  updateDocumentTitle() {
    let { controller } = this.props
    let { html } = controller.store.getState()

    if (html && html.title && html.title !== document.title) {
      document.title = html.title
    }
  }

  async emit(method: string) {
    let { controller } = this.props
    try {
      // @ts-ignore
      if (typeof controller[method] === 'function') {
        // @ts-ignore
        await controller[method]()
      }
    } catch (error) {
      if (controller.errorDidCatch) {
        controller.errorDidCatch(error as Error, 'controller')
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
