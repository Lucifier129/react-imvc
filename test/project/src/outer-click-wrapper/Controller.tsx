import React from 'react'
import IMVC from '../../../../index'
import Controller from '../../../../controller'
import { OuterClickWrapper } from '../../../../component'

const initialState = {
  count: 0
}

export default class extends Controller<typeof initialState, {}> {
	SSR = true // enable server side rendering
  View = View
  initialState = initialState
  constructor(location: IMVC.Location, context: IMVC.Context) {
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
    <div id="outer_click_wrapper">
      link to page
      <div id="">

      </div>
    </div>
  )
}
