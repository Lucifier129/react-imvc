import Controller from '../../../src/controller'
import React from 'react'
import { Location, Context } from '../../../src/'
import '../img/react.png'
import 'test-pkg/dist/test-use'

export default class extends Controller<{}, {}> {
  SSR = false // disable server side rendering
  View = View
  constructor(location: Location, context: Context) {
    super(location, context)
  }
}

function View() {
  return (
    <div id="static_view_csr">static view content by client side rendering</div>
  )
}
