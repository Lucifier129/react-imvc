import React from 'react'
import GlobalContext from '../context'

export default class Prefetch extends React.Component {
    static contextType = GlobalContext
    componentDidMount() {
        this.context.prefetch(this.props.src)
    }
    render() {
        return null
    }
}
