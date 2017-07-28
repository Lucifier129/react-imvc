import React, { Component, PropTypes } from 'react'

export default class Preload extends Component {
  static contextTypes = {
    preload: PropTypes.object
  };
  static defaultProps = {
    as: 'div'
  };
  render () {
    let { preload } = this.context
    let { name, as: Tag, ...props } = this.props
    let content = preload[name]
    if (Tag == null || content == null) {
      return null
    }
    return (
      <Tag {...props} data-preload={name}>
        {content}
      </Tag>
    )
  }
}
