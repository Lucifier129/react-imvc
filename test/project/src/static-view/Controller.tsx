import Controller from '../../../../controller'
import React from 'react'
import IMVC from '../../../../index'
export default class extends Controller {
	SSR = true // enable server side rendering
	View = View
  constructor(location: IMVC.Location, context: IMVC.Context) {
    super(location, context)
    console.log(context.isClient)
    console.log(context.isServer)
  }
}

function View() {
	return <div id="static_view">static view content</div>
}
