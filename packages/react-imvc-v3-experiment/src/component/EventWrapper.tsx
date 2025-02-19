import React from 'react'
import GlobalContext from '../context'

const isHandler = (key: string) => /^on[A-Z]+/.test(key)

export interface EventWrapperProps {
  as?: keyof HTMLElementTagNameMap
  [propName: string]: any
}

export default class EventWrapper extends React.Component<EventWrapperProps> {
  static contextType = GlobalContext
  static defaultProps: EventWrapperProps = {
    as: 'div',
  }

  render() {
    const { children, as: tag, ...restProps } = this.props
    let props: Record<string, any> = restProps
    const { ctrl } = this.context
    for (let key in props) {
      if (isHandler(key)) {
        const handler = ctrl[props[key]]
        if ('function' === typeof handler) {
          props[key] = handler
        }
      }
    }
    return React.createElement(tag ? tag : 'div', props, children)
  }
}
