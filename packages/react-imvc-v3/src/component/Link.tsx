import React from 'react'
import GlobalContext from '../context'
import type { BaseLocation } from 'create-history'

export type LinkProps = React.PropsWithChildren<{
  as?: keyof HTMLElementTagNameMap
  to?: string | BaseLocation
  href?: string
  replace?: boolean
  back?: boolean
  forward?: boolean
  go?: number
  prefetch?: boolean
  [propName: string]: any
}>

export default class Link extends React.Component<LinkProps> {
  static contextType = GlobalContext
  static defaultProps: LinkProps = {
    as: 'a',
  }

  componentDidMount() {
    if (this.props.prefetch) {
      this.context.prefetch(this.props.to || this.props.href)
    }
  }

  render() {
    let { basename = '' } = this.context.state as { basename: string }
    let {
      to,
      href,
      children,
      replace,
      back,
      forward,
      go,
      as: tag,
      prefetch,
      ...others
    } = this.props

    if (tag === 'a') {
      let targetPath = to ? `${basename}${to}` : null
      if (!targetPath && href) {
        targetPath = href
      }
      return (
        <a {...others} href={targetPath as string} onClick={this.handleClick}>
          {children}
        </a>
      )
    }

    return React.createElement(
      tag as keyof HTMLElementTagNameMap,
      Object.assign({}, others, { onClick: this.handleClick }),
      children
    )
  }

  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    let { onClick, replace, back, forward, go, to } = this.props
    let { history } = this.context
    onClick && onClick(event)

    if (
      event.defaultPrevented || // onClick prevented default
      event.button !== 0 || // ignore everything but left clicks
      this.props.target || // let browser handle "target=_blank" etc.
      isModifiedEvent(event) // ignore clicks with modifier keys
    ) {
      return
    }

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
  }
}

function isModifiedEvent(event: React.MouseEvent<HTMLElement>) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
}
