import React from 'react'

/**
 * BaesView 组件
 * 映射 React Component 的生命周期方法
 * 传递 React Component 的 context 对象
 */
export default class Provider extends React.Component {
  static childContextTypes = {
    location: React.PropTypes.object,
    history: React.PropTypes.object,
    actions: React.PropTypes.object,
    state: React.PropTypes.object,
    preload: React.PropTypes.object,
    handlers: React.PropTypes.object,
    handleInputChange: React.PropTypes.func,
  };
  getChildContext () {
    return this.props.context
  }
  render () {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}
