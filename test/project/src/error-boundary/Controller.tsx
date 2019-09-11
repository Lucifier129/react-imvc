import ErrorBoundary from '../../../../component/ErrorBoundary'
import Controller from '../../../../controller'
import React, { useState } from 'react'
import IMVC from '../../../../index'

const actions = {
  TEST: () => {
    throw new Error('action-test')
  }
}

export default class extends Controller<{}, typeof actions> {
  constructor(location: IMVC.Location, context: IMVC.Context) {
    super(location, context)
  }
  SSR = true // enable server side rendering
  View = View
  actions = actions
  // componentWillCreate() {
  //   throw new Error('componentWillCreate')
  // }
  getComponentFallback(displayName: string) {
    return `component-fallback: ${displayName}`
  }
  getViewFallback() {
    return 'view-fallback'
  }
  errorDidCatch(error: Error, type: string) {
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
