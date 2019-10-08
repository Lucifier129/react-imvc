import React from 'react'
import { Location, Context } from '../../../../type'
import Controller from '../../../../controller'

export default class extends Controller<{}, {}, typeof View> {
	SSR = true // enable server side rendering
	View = View
  constructor(location: Location, context: Context) {
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
