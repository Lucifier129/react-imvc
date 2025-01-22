import Controller from '../../../controller'
import React from 'react'

export default class extends Controller {
    SSR = this.location.query.ssr !== '0'
    View = View
    initialState = {
        count: 0,
    }
    actions = {
        incre: (state, step = 1) => {
            return {
                count: state.count + step,
            }
        },
        decre: (state, step = 1) => {
            return {
                count: state.count - step,
            }
        },
    }
    componentDidMount() {
        console.log('didMount')
    }
}

function View({ state, actions }) {
    return (
        <div>
            <button onClick={() => actions.decre()}>-</button>
            <span>{state.count}</span>
            <button onClick={() => actions.incre()}>+</button>
        </div>
    )
}
