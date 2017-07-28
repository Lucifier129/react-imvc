import React, { Component, PureComponent, Children, PropTypes } from 'react'

/**
 * BaesView 组件
 * 映射 React Component 的生命周期方法
 * 传递 React Component 的 context 对象
 */
export default class BaseView extends PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    actions: PropTypes.object,
    state: PropTypes.object,
    preload: PropTypes.object,
    handlers: PropTypes.object,
    handleInputChange: PropTypes.func,
  };
  getChildContext () {
    return this.props.context
  }
  render () {
    return Children.only(this.props.children)
  }
}
