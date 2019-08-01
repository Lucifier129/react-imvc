import React from 'react'
import GlobalContext from '../context'

// fixed: webpack rebuild lost original React.createElement
// @ts-ignore
let createElement = React.originalCreateElement || React.createElement

type Props = {
  fallback: object | null
  children?: { (...args:any):any }
}

type State = {
  hasError: boolean
}

export default class ErrorBoundary extends React.Component<Props, State> {
  static ignoreErrors:boolean = true
  static contextType:React.Context<any> = GlobalContext
  static getDerivedStateFromError():{ hasError:boolean } {
    return { hasError: true }
  }
  static defaultProps:Props = {
    fallback: null
  }
  state:State = {
    hasError: false
  }
  catchError(error:Error):void {
    let { ctrl } = this.context
    if (ctrl.errorDidCatch) {
      ctrl.errorDidCatch(error, 'view')
    }
  }
  componentDidCatch(error:Error):void {
    this.catchError(error)
  }
  render():React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback
    }
    let prevCreateElement = React.createElement
    React.createElement = createElement
    try {
      return (this.props.children as { (...args:any):any })()
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

  const displayName:string = InputComponent.name || InputComponent.displayName as string

  Component.name = `ErrorBoundary(${displayName})`

  return Component
}
