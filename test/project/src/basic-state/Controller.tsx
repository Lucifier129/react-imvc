import { Location, Context } from '../../../../src/type'
import Controller from '../../../../src/controller'
import React from 'react'

export default class extends Controller<{}, {}, typeof View> {
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


function View({ state }: { state: object }) {
    return <pre id="basic_state">{JSON.stringify(state, undefined, 2)}</pre>
}