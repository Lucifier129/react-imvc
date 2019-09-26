import React from 'react'

import Controller from '../controller'

interface GlobalContent <Ctrl extends Controller<{ }, { }, any>> {
  ctrl: Ctrl
  location: 
}

let a = <Ctrl extends Controller<{ }, { }, any>>(ctrl: Ctrl) => {
  React.createContext({
    ctrl,
    location: ctrl,
    state: ctrl.store.getState(),
    actions: ctrl.store.actions,
    preload: ctrl.context.preload
  })
}

export default 

class Greeter {
  greeting: string;
  constructor(message: string) {
      this.greeting = message;
  }
  greet() {
      return "Hello, " + this.greeting;
  }
}

let greeter = new Greeter("world");