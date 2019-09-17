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

function View({ state, handlers }) {
	return (
    <div id="outer_click">
      <div id="out">
        <div>
          <p id="beside">beside region</p>
        </div>
        <OuterClickWrapper onClick={handlers.handleClick}>
          <p id="inner">inner region</p>
        </OuterClickWrapper>
      </div>
      <p id="count">{state.count}</p>
    </div>
  )
}