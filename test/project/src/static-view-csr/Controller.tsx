import Controller from '../../../../controller'
import React from 'react'
import { NativeLocation, Context } from '../../../../type'
export default class extends Controller<{}, {}, typeof View> {
    SSR = false // disable server side rendering
    View = View
    constructor(location: NativeLocation, context: Context) {
        super(location, context)
    }
}

function View() {
    return (
        <div id="static_view_csr">static view content by client side rendering</div>
    )
}