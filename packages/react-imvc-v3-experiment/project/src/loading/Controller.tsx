import Controller from '../../../src/controller'
import React from 'react'
import { Location, Context } from '../../../src/'
export default class extends Controller<{}, {}> {
  SSR = false // enable server side rendering
  View = View
  Loading = Loading
  constructor(location: Location, context: Context) {
    super(location, context)
  }
}

function View() {
  return <div id="load">load</div>
}

function Loading() {
  return <div id="loading">loading...</div>
}
