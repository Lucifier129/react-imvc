import React from 'react'
import GlobalContext from '../context'

const isHandler = (key) => /^on[A-Z]+/.test(key)

export default class EventWrapper extends React.Component {
    static contextType = GlobalContext
    static defaultProps = {
        as: 'div',
    }
    render() {
        const { children, as: Tag, ...props } = this.props
        const { handlers } = this.context
        for (let key in props) {
            if (isHandler(key)) {
                const handler = handlers[props[key]]
                if ('function' === typeof handler) {
                    props[key] = handler
                }
            }
        }
        return <Tag {...props}>{children}</Tag>
    }
}
