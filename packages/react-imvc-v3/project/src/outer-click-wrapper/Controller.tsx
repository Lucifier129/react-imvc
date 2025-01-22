import React from 'react'
import { Location, Context } from '../../../src/'
import Controller from '../../../src/controller'
import { OuterClickWrapper } from '../../../src/component'

export interface State {
  count: number
}

export interface Ctrl {
  handleClick: Function
}

const initialState: State = {
  count: 0,
}

export default class extends Controller<State, {}> implements Ctrl {
  SSR = true // enable server side rendering
  View = View
  initialState = initialState
  constructor(location: Location, context: Context) {
    super(location, context)
  }

  handleClick = () => {
    this.store.actions.UPDATE_INPUT_VALUE({
      count: this.store.getState().count + 1,
    })
  }
}

export type ViewProps = {
  state: State
  ctrl: Ctrl
}

function View({ state, ctrl }: ViewProps) {
  return (
    <div id="outer_click">
      <div id="out">
        <div>
          <p id="beside">beside region</p>
        </div>
        {/* @ts-ignore */}
        <OuterClickWrapper onClick={ctrl.handleClick}>
          <p id="inner">inner region</p>
        </OuterClickWrapper>
      </div>
      <p id="count">{state.count}</p>
    </div>
  )
}
