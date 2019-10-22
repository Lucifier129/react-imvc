import { Location, Context, ViewProps } from '../../../../src/'
import Controller from '../../../../src/controller'
import React from 'react'

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


function View({ state }: ViewProps<{}, {}>) {
    let content = ''
    try {
        content = JSON.stringify(state)
    } catch (e) {
        content = 'error'
    }
    return <div id="basic_state">{content}</div>
}