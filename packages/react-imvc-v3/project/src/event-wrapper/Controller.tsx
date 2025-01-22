import React from 'react'
import { Location, Context } from '../../../src/'
import Controller from '../../../src/controller'
import { EventWrapper } from '../../../src/component'

const initialState = {
  count: 0,
}

export default class extends Controller<typeof initialState, {}> {
  SSR = true // enable server side rendering
  View = View
  initialState = initialState
  constructor(location: Location, context: Context) {
    super(location, context)
  }

  handleClick = () => {
    // @ts-ignore
    this.store.actions.UPDATE_INPUT_VALUE({
      count: this.store.getState().count + 1,
    })
  }
}

function View({ state }: any) {
  return (
    <div id="event">
      <EventWrapper onClick="handleClick">
        <p id="inner">inner region</p>
      </EventWrapper>
      <p id="count">{state.count}</p>
    </div>
  )
}
