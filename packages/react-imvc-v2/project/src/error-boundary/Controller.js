import Controller from '../../../controller'
import ErrorBoundary from '../../../component/ErrorBoundary'
import React, { useState, useEffect } from 'react'

export default class extends Controller {
    SSR = true // enable server side rendering
    View = View
    actions = {
        TEST: () => {
            throw new Error('action-test')
        },
    }
    // componentWillCreate() {
    //   throw new Error('componentWillCreate')
    // }
    getComponentFallback(displayName) {
        return `component-fallback: ${displayName}`
    }
    getViewFallback() {
        return 'view-fallback'
    }
    errorDidCatch(error, type) {
        console.log('error-did-catch', type, error)
    }
    componentDidMount() {
        setTimeout(() => {
            this.store.actions.TEST()
        })
    }
}

function View() {
    return (
        <>
            <Section />
            <br />
            <ErrorBoundary fallback={'error-boundary'}>
                {() => {
                    throw new Error('force')
                    return <Button message="in error boundary" />
                }}
            </ErrorBoundary>
        </>
    )
}

const Button = ({ message = 'test' }) => {
    let [count, setCount] = useState(0)

    if (count > 0) {
        throw new Error(message)
    }

    let handleClick = () => {
        setCount(count + 1)
    }

    return <button onClick={handleClick}>button</button>
}

const Section = ({}) => <Button />
