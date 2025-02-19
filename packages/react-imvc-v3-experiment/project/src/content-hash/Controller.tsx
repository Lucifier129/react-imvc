import { Location, Context, BaseState } from '../../../src'
import Controller from '../../../src/controller'
import Style from '../../../src/component/Style'
import React, { useState } from 'react'

declare global {
  module NodeJS {
    interface Global {
      controller: any
    }
  }
  interface Window {
    controller: any
  }
}

export default class BatchRefreshController extends Controller<{}, {}> {
  View = View
  preload = {
    style: '/content-hash/style.css',
  }
  constructor(location: Location, context: Context) {
    super(location, context)
    if (context.isClient) {
      window.controller = this
    } else if (context.isServer) {
      global.controller = this
    }
  }
  initialState = {
    count: 0,
    text: '',
  }
}

export type ViewProps = {
  state: BaseState
}

function View({ state }: ViewProps) {
  return (
    <div id="debounce-refresh">
      <Style name="style" />
      <div id="count">{state.count}</div>
    </div>
  )
}
