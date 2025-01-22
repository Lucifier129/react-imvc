import Controller from '../../../controller'
import { Style } from '../../../component'
import React from 'react'
import style from './style.css'

export default class extends Controller {
    SSR = this.location.query.ssr !== '0'
    View = View
    constructor(location, context) {
        super(location, context)
        if (context.isClient) {
            window.controller = this
        } else if (context.isServer) {
            global.controller = this
        }
    }
    preload = {
        style: style,
    }
    publicPathPlaceholder = '#public_path'
}

function View({ state }) {
    return (
        <>
            <Style name="style" />
            <pre id="basic_state">{JSON.stringify(state, null, 2)}</pre>
            <div className="logo" />
            <img src={state.publicPath + '/img/react.png'} />
        </>
    )
}
