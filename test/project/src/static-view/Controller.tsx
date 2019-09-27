import Controller from '../../../../controller'
import React from 'react'
import { NativeLocation, Context } from '../../../../type'
export default class extends Controller<{}, {}, typeof View> {
	// SSR = true // enable server side rendering
	View = View
  constructor(location: NativeLocation, context: Context) {
    super(location, context)
  }
}

function View() {
	return <div id="static_view">static view content</div>
}
