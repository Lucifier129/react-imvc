import Controller from '../../../../controller'
import React from 'react'
import IMVC from '../../../../index'
export default class extends Controller<{}, {}> {
    SSR = false // disable server side rendering
    View = View
    constructor(location: IMVC.Location, context: IMVC.Context) {
        super(location, context)
    }
}

function View() {
    return (
        <div id="static_view_csr">static view content by client side rendering</div>
    )
}