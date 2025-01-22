import React from 'react'
import { Location, Context } from '../../../src/'
import Controller from '../../../src/controller'

export default class extends Controller<{}, {}> {
  SSR = true // enable server side rendering
  View = View
  constructor(location: Location, context: Context) {
    super(location, context)
  }
}

function View() {
  return <div id="link_to">link to page</div>
}
