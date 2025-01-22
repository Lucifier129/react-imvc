import Controller from '../../../controller'
import React from 'react'
export default class extends Controller {
    SSR = false // disable server side rendering
    View = View
}

function View() {
    return <div id="static_view_csr">static view content by client side rendering</div>
}
