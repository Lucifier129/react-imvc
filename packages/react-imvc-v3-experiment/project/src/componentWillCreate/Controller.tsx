import React from 'react'
import { BaseState } from '../../../src'
import Controller from '../../../src/controller'

export default class Todo extends Controller<BaseState, {}> {
  SSR = false
  componentWillCreate() {
    this.View = View
  }
}

function View() {
  return <div id="componentWillCreate">componentWillCreate</div>
}
