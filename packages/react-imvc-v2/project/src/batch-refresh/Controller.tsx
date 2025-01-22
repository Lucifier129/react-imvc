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
        count: 0,
        text: '',
    }
    // 选择是否禁用防抖刷新
    disableBatchRefresh: boolean = false
    handleIncre = () => {
        setTimeout(() => {
            // 重复调用多次，只会触发一次更新
            this.store.actions.UPDATE_STATE({
                count: this.store.getState().count + 1,
            })
            this.store.actions.UPDATE_STATE({
                count: this.store.getState().count + 1,
            })
        }, 0)
    }

    handleIncreFlushSync = () => {
        setTimeout(() => {
            this.flushSync(() => {
                this.store.actions.UPDATE_STATE({
                    count: this.store.getState().count + 1,
                })
                this.store.actions.UPDATE_STATE({
                    count: this.store.getState().count + 1,
                })
            })
        }, 0)
    }

    handleChange = (text: string) => {
        this.flushSync(() => {
            this.store.actions.UPDATE_STATE({
                text: text,
            })
        })
    }
}

function View({ state }: any) {
    const ctrl = useCtrl()

    console.log('render', state.count, state.text)
    return (
        <div id="debounce-refresh">
            <div id="count">{state.count}</div>
            <button id="ctrl-incre" onClick={ctrl.handleIncre}>
                batch-incre
            </button>
            <button id="state-incre" onClick={ctrl.handleIncreFlushSync}>
                flush-incre
            </button>
            <div>
                <label>flush-input</label>
                <input id="text" value={state.text} onChange={(e) => ctrl.handleChange(e.target.value)} />
            </div>
        </div>
    )
}
