import Controller from '../../../controller'
import useCtrl from '../../../hook/useCtrl'
import React, { useState } from 'react'

declare global {
    module NodeJS {
        interface Global {
            controller: any
        }
    }
    interface Window {
        controller: any
    }
}

export default class BatchRefreshController extends Controller {
    View = View
    constructor(location: any, context: any) {
        super(location, context)
        if (context.isClient) {
            window.controller = this
        } else if (context.isServer) {
            global.controller = this
        }
    }
    initialState = {
        count: 0
    }
    // 选择是否禁用防抖刷新
    disableBatchRefresh: boolean = true
    handleIncre = () => {
        setTimeout(() => {
            // 重复调用多次，只会触发一次更新
            this.store.actions.UPDATE_STATE({
                count: this.store.getState().count + 1
            })
            this.store.actions.UPDATE_STATE({
                count: this.store.getState().count + 1
            })
        }, 0)
    }
}


function View({ state }: any) {
    const ctrl = useCtrl()
    const [count, setCount] = useState(0)

    const handleIncre = () => {
        setTimeout(() => {
            setCount(count => count + 1)
            setCount(count => count + 1)
        }, 0)
    }


    console.log('render', state.count, count)
    return (
        <div id="debounce-refresh">
            <div id="count">{state.count}</div>
            <button id="ctrl-incre" onClick={ctrl.handleIncre}>
                ctrl.incre
            </button>
            <button id="state-incre" onClick={handleIncre}>
                state.incre
            </button>
        </div>
    )
}
