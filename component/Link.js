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
    let { to, href, children, replace, back, forward, go, as, ...others } = this.props
    let Tag = as

    if (Tag === 'a') {
      let targetPath = to ? `${basename}${to}` : null
      if (!targetPath && href) {
        targetPath = href
      }
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
    let { onClick, replace, back, forward, go, to } = this.props
    let { history, location } = this.context
    onClick && onClick(event)

    if (back) {
      history.goBack()
    } else if (forward) {
      history.goForward()
    } else if (go) {
      history.go(go)
    } else if (to) {
      event.preventDefault()
      if (replace === true) {
        history.replace(to)
      } else {
        history.push(to)
      }
    }
  };
}
