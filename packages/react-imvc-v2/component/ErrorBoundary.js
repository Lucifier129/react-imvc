import React from 'react'
import GlobalContext from '../context'

// fixed: webpack rebuild lost original React.createElement
let createElement = React.originalCreateElement || React.createElement

export default class ErrorBoundary extends React.Component {
    static ignoreErrors = true
    static contextType = GlobalContext
    static getDerivedStateFromError() {
        return { hasError: true }
    }
    static defaultProps = {
        fallback: null,
    }
    state = {
        hasError: false,
    }
    catchError(error) {
        let { ctrl } = this.context
        if (ctrl.errorDidCatch) {
            ctrl.errorDidCatch(error, 'view')
        }
    }
    componentDidCatch(error) {
        this.catchError(error)
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback
        }
        let prevCreateElement = React.createElement
        React.createElement = createElement
        try {
            return this.props.children()
        } catch (error) {
            this.catchError(error)
            return this.props.fallback
        } finally {
            React.createElement = prevCreateElement
        }
    }
}

export const withFallback = (fallback) => (InputComponent) => {
    function Component(props) {
        return createElement(ErrorBoundary, { fallback }, () => createElement(InputComponent, props))
    }

    const displayName = InputComponent.name || InputComponent.displayName

    Component.name = `ErrorBoundary(${displayName})`

    return Component
}
