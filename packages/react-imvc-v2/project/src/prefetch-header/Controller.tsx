import Controller from '../../../controller'
import React from 'react'
import { Style } from '../../../component'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default class extends Controller {
    // SSR = false // enable server side rendering
    preload = {
        css: '/prefetch-header/preload.css',
    }
    View = View
    disableEarlyHints: boolean = false
    async componentWillCreate() {
        this.addEarlyHintsLinks([
            {
                uri: '/img/react.png',
                rel: 'preload',
                as: 'image',
            },
            {
                uri: '/prefetch-header/preload.css',
                rel: 'preload',
                as: 'style',
            },
        ])

        this.flushHeaders()

        await delay(500)
    }
    constructor(location: any, context: any) {
        super(location, context)
    }
}

function View() {
    return (
        <div id="style">
            <Style name="css" />
            <div>static view content</div>
        </div>
    )
}
