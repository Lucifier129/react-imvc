import Controller from '../../../src/controller'
import React from 'react'
import { Location, Context, BaseState, Action } from '../../../src'

type State = BaseState & {
  data: {
    foo: string
  }
}

const initialState = {
  data: {
    foo: '',
  },
}

interface Payload {
  data: { foo: string }
}
const UPDATE_DATA: Action<State, Payload> = (state, payload) => {
  return {
    ...state,
    data: payload,
  }
}

const actions = {
  UPDATE_DATA,
}

export default class RestAPI extends Controller<State, typeof actions> {
  View = View
  initialState = initialState
  actions = actions
  restapi = 'restapi'
  constructor(location: Location, context: Context) {
    super(location, context)
  }
  async componentWillCreate() {
    await this.fetch('/foo')
      .then((data) => {
        this.store.actions.UPDATE_DATA(data)
      })
      .catch((err) => {
        console.error(err)
      })
  }
}

interface ViewProps {
  state: State
  ctrl: RestAPI
}

function View({ state }: ViewProps) {
  return <div id="restapi">{state.data.foo}</div>
}
