import Controller from '../../../controller'
import { Style } from '../../../component'
import React from 'react'

export default class extends Controller {
    SSR = this.location.query.ssr !== '0'
    View = View;
    constructor(location, context) {
        super(location, context)
        if (context.isClient) {
            window.controller = this
        } else if (context.isServer) {
            global.controller = this
        }
    }
    preload = {
        style: '/preload/style.css',
    }
}


function View({ state }) {
    return <>
        <Style name="style" />
        <pre id="basic_state">{JSON.stringify(state, null, 2)}</pre>
        <div className='logo' />
    </>
}