import Controller from '../../../../controller'
import React from 'react'
export default class extends Controller {
    SSR = true // enable server side rendering
    View = View
}


function View() {
    return (
        <div id="ssr_target">static view content</div>
    )
}