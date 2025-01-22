import React from 'react'
import GlobalContext from '../context'
import type { BaseState } from '..'

// fixed: webpack rebuild lost original React.createElement
// @ts-ignore
let createElement = React.originalCreateElement || React.createElement

export interface ErrorBoundaryProps {
  fallback: object | string | null
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  Partial<BaseState>
> {
  static ignoreErrors = true
  static contextType = GlobalContext
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  static defaultProps: ErrorBoundaryProps = {
    fallback: null,
  }
  state: Readonly<Partial<BaseState>> = {
    hasError: false,
  }

  catchError(error: Error) {
    let { ctrl } = this.context
    if (ctrl.errorDidCatch) {
      ctrl.errorDidCatch(error, 'view')
    }
  }

  componentDidCatch(error: Error) {
    this.catchError(error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    let prevCreateElement = React.createElement
    React.createElement = createElement
    try {
      return this.props.children
    } catch (error) {
      this.catchError(error as Error)
      return this.props.fallback
    } finally {
      React.createElement = prevCreateElement
    }
  }
}

export const withFallback =
  (fallback: object) => (InputComponent: React.ComponentType) => {
    function Component(props: object) {
      return createElement(ErrorBoundary, { fallback }, () =>
        createElement(InputComponent, props)
      )
    }

    const displayName = InputComponent.name || InputComponent.displayName

    Component.name = `ErrorBoundary(${displayName})`

    return Component
  }
