import Controller from '../../../controller'
import React from 'react'

export default class extends Controller {
    SSR = this.location.query.ssr !== '0'
    View = View
    componentDidMount() {
        console.log('didMount')
    }
}

function View({ state }) {
    console.log('Render View')
    return <Child></Child>
}

function Child() {
    console.log('Render Child')
    return 'test'
}
