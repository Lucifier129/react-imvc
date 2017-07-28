import React, { Component, PropTypes } from 'react'

export default class Link extends Component {
  static contextTypes = {
    location: PropTypes.object,
    history: PropTypes.object
  };
  static defaultProps = {
    as: 'a'
  };
  render () {
    let { basename = '' } = this.context.location
    let { to, children, replace, as, ...others } = this.props
    let Tag = as

    if (Tag === 'a') {
      let targetPath = to ? `${basename}${to}` : null
      return (
        <a {...others} href={targetPath} onClick={this.handleClick}>
          {children}
        </a>
      )
    }

    return (
      <Tag {...others} onClick={this.handleClick}>
        {children}
      </Tag>
    )
  }
  handleClick = event => {
    let { onClick, replace, to } = this.props
    let { history, location } = this.context
    onClick && onClick(event)
    if (!to) {
      return
    }
    event.preventDefault()
    if (replace === true) {
      history.replace(to)
    } else {
      history.push(to)
    }
  };
}
