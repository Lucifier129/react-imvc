import React from 'react'
import GlobalContext from '../context'

// fixed: webpack rebuild lost original React.createElement
// @ts-ignore
let createElement = React.originalCreateElement || React.createElement

interface Props {
  fallback: object | null
  children?: React.ReactChildren
}

type State = {
  hasError: boolean
}

export default class ErrorBoundary extends React.Component<Props, State> {
  static ignoreErrors = true
  static contextType = GlobalContext
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  static defaultProps:Props = {
    fallback: null
  }
  state:State = {
    hasError: false
  }
  catchError(error:Error) {
    let { ctrl } = this.context
    if (ctrl.errorDidCatch) {
      ctrl.errorDidCatch(error, 'view')
    }
  }
  componentDidCatch(error:Error) {
    this.catchError(error)
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    let prevCreateElement = React.createElement
    React.createElement = createElement
    try {
      return this.props.children as React.ReactChildren
    } catch (error) {
      this.catchError(error)
      return this.props.fallback
    } finally {
      React.createElement = prevCreateElement
    }
  }
}

export const withFallback = (fallback: object) => (InputComponent: React.ComponentType) => {
  function Component(props:object) {
    return createElement(ErrorBoundary, { fallback }, () =>
      createElement(InputComponent, props)
    )
  }

  // const displayName = InputComponent.name || InputComponent.displayName

  // Component.name = `ErrorBoundary(${displayName})`

  return Component
}
