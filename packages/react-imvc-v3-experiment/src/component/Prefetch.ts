import React from 'react'
import GlobalContext from '../context'

export interface PrefetchProps {
  src: string
}

export default class Prefetch extends React.Component<PrefetchProps> {
  static contextType = GlobalContext

  componentDidMount() {
    this.context.prefetch(this.props.src)
  }

  render() {
    return null
  }
}
