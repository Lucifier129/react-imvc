import React from 'react'
import Controller from '../controller'

type Props = {
  controller: Controller
}

/**
 * ViewProxy 把 react 组件生命周期同步到 controller 里
 * 根据 state 更新 document.title
 */
export default class ControllerProxy extends React.Component<Props> {
  static ignoreErrors = true
  updateDocumentTitle():void {
    let { controller } = this.props
    let { html } = controller.store.getState()

    if (html && html.title !== document.title) {
      document.title = html.title
    }
  }
  emit(method:string):void {
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
  componentDidMount():void {
    let { controller } = this.props
    this.updateDocumentTitle()
    if (!controller.meta.hadMounted) {
      controller.meta.hadMounted = true
      this.emit('componentDidFirstMount')
    }
    this.emit('componentDidMount')
  }
  componentWillUnmount():void {
    this.emit('componentWillUnmount')
  }
  componentDidUpdate():void {
    this.updateDocumentTitle()
  }
  render():React.ReactNode {
    return null
  }
}
