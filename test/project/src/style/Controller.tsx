import React from 'react'
import { Location, Context } from '../../../../src/'
import Controller from '../../../../src/controller'
import { Style } from '../../../../src/component'

export default class extends Controller<{}, {}> {
	SSR = true // enable server side rendering
  View = View
  preload = {
    css: '/style/preload.css'
  }
  constructor(location: Location, context: Context) {
    super(location, context)
  }

  handleClick = () => {
    this.store.actions.UPDATE_INPUT_VALUE({
      count: this.store.getState().count + 1
    })
  }
}

function View() {
	return (
    <div id="style">
      <Style name="css" />
      <div className="style"></div>
    </div>
  )
}
