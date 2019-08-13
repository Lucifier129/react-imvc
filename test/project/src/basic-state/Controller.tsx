import RIMVC from '../../../../src'
import React from 'react'

export default class extends RIMVC.Controller {
    View = View;
    constructor(location: RIMVC.Location, context: RIMVC.Context) {
        super(location, context)
        if (context.isClient) {
            (window as RIMVC.WindowNative).controller = this
        } else if (context.isServer) {
            (global as RIMVC.Global).controller = this
        }
    }
}


function View({ state }: RIMVC.ViewProps) {
    return <pre id="basic_state">{JSON.stringify(state, null, 2)}</pre>
}