import Controller from '../../../src/controller'
import React, { useState, useCallback } from 'react'
import { Location, Context } from '../../../src/'
export default class extends Controller<{}, {}> {
  SSR = false
  View = View
  resetScrollOnMount = true
  constructor(location: Location, context: Context) {
    super(location, context)
  }
}

function View() {
  let nativeScroll = window.scroll
  const [status, setStatus] = useState('failure')
  const handleScroll = () => {
    setStatus('success')
  }
  window.scroll = handleScroll
  useCallback(() => {
    return () => (window.scroll = nativeScroll)
  }, [])
  return <div id="scroll">{status}</div>
}
