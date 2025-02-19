import { Location, Context, BaseState } from '../../../src/'
import Controller from '../../../src/controller'
import React from 'react'

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

export default class extends Controller<{}, {}> {
  View = View
  constructor(location: Location, context: Context) {
    super(location, context)
    if (context.isClient) {
      window.controller = this
    } else if (context.isServer) {
      global.controller = this
    }
  }
}

export type ViewProps = {
  state: BaseState
}

function View({ state }: ViewProps) {
  let content = ''
  try {
    content = JSON.stringify(state)
  } catch (e) {
    content = 'error'
  }
  return <div id="basic_state">{content}</div>
}
