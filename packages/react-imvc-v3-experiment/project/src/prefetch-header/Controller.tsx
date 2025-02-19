import Controller from '../../../src/controller'
import React from 'react'
import { Location, Context } from '../../../src'
import { Style } from '../../../src/component'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default class extends Controller<{}, {}> {
  // SSR = false // enable server side rendering
  preload = {
    css: '/style/preload.css',
  }
  View = View
  disableEarlyHints: boolean = false
  async componentWillCreate() {
    this.addEarlyHintsLinks([
      {
        uri: '/img/react.png',
        rel: 'preload',
        as: 'image',
      },
      {
        uri: '/style/preload.css',
        rel: 'preload',
        as: 'style',
      },
    ])

    this.flushHeaders()

    await delay(500)
  }
  constructor(location: Location, context: Context) {
    super(location, context)
  }
}

function View() {
  return (
    <div id="style">
      <Style name="css" />
      <div>static view content</div>
    </div>
  )
}
