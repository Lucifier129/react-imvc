import React from 'react'
import IMVC from '../../../../index'
import Controller from '../../../../controller'

export default class extends Controller<{}, {}> {
	SSR = true // enable server side rendering
	View = View
  constructor(location: IMVC.Location, context: IMVC.Context) {
    super(location, context)
  }
}

function View() {
	return (
    <div id="link_to">
      link to page
    </div>
  )
}
