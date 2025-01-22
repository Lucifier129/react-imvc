import { Location, Context } from '../../../src/'
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

export default class Ctrl extends Controller<{}, {}> {
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
  state: object
  ctrl: Ctrl
}

function View({ ctrl }: ViewProps) {
  let content = ''
  try {
    content = JSON.stringify(ctrl.location)
  } catch (e) {
    content = 'error'
  }
  return <div id="location">{content}</div>
}
