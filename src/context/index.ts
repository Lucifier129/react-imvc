import React from 'react'
import { ClientController } from 'create-app/client'
import Controller from '../controller'

const createContext = <Ctrl extends Controller<any, any, any>>(ctrl: Ctrl & ClientController) => {
  type GlobalContextType = {
    ctrl: typeof ctrl,
    location: typeof ctrl.location,
    history: typeof ctrl.history,
    state: ReturnType<typeof ctrl.store.getState>,
    actions: typeof ctrl.store.actions,
    preload: typeof ctrl.context.preload,
    handlers:typeof  ctrl.handlers,
    matcher: typeof ctrl.matcher,
    loader: typeof ctrl.loader,
    prefetch: typeof ctrl.prefetch
  }
  return React.createContext<GlobalContextType>({} as any)
}

let GlobalContext = createContext({} as Controller<any, any, any> & ClientController)

export default GlobalContext