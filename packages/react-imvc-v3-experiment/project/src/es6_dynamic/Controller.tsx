import Controller from '../../../src/controller'
import React from 'react'
import { Location, Context } from '../../../src'

export default class extends Controller<{}, {}> {
  // SSR = true // enable server side rendering
  View = View
  constructor(location: Location, context: Context) {
    super(location, context)
  }
}

function View() {
  return <div id="es6_dynamic">es6 dynamic content</div>
}
