import React from 'react'

/**
 * Root 组件
 * 传递 React Component 的 context 对象
 */
export default class Root extends React.Component {
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
