import React from 'react'
import IMVC from '../../../../index'
import Controller from '../../../../controller'
import { Style } from '../../../../component'

export default class extends Controller<{}, {}> {
	SSR = true // enable server side rendering
  View = View
  preload = {
    css: '/style/preload.css'
  }
  constructor(location: IMVC.Location, context: IMVC.Context) {
    super(location, context)
  }

  handleClick = () => {
    this.store.actions.UPDATE_INPUT_VALUE({
      count: this.store.getState().count + 1
    })
  }
}

function View({ state, handlers }) {
	return (
    <div id="style">
      <Style name="css" />
      <div className="style"></div>
    </div>
  )
}
