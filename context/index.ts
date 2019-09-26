import React from 'react'
import { ClientController } from 'create-app/client'
import Controller from '../controller'

const createContext = <Ctrl extends Controller<{ }, { }, any>>(ctrl: Ctrl & ClientController) => {
  return React.createContext({
    ctrl,
    location: ctrl.location,
    history: ctrl.history,
    state: ctrl.store.getState(),
    actions: ctrl.store.actions,
    preload: ctrl.context.preload,
    handlers: ctrl.handlers,
    matcher: ctrl.matcher,
    loader: ctrl.loader,
    prefetch: ctrl.prefetch
  })
}

let GlobalContext = createContext({} as Controller<{ }, { }, any> & ClientController)

export default GlobalContext