import React from 'react'
import { Location, Context } from '../../../src/'
import Controller from '../../../src/controller'
import { Input } from '../../../src/component'

const initialState = {
  // 多层次对象
  user: {
    name: {
      first: '',
      last: '',
    },
    email: '',
    age: 0,
  },
  // 数组对象
  friends: [
    {
      name: 'friendA',
    },
    {
      name: 'friendB',
    },
  ],
  // 复合对象
  phone: {
    value: '',
    isValid: false,
    isWarn: false,
  },
  content: '',
}

export default class extends Controller<typeof initialState, {}> {
  SSR = true // enable server side rendering
  View = View
  initialState = initialState
  constructor(location: Location, context: Context) {
    super(location, context)
  }
}

function isValidPhone(value: string) {
  return /^[0-9]+$/gi.test(value)
}

export type ViewProps = {
  state: typeof initialState
}

function View({ state }: ViewProps) {
  return (
    <div id="input">
      input page
      <div>
        firstname: <Input name="user.name.first" id="first-name-input" />
        friends:{' '}
        {state &&
          state.friends &&
          state.friends.map((friend, index) => {
            return (
              <div key={index}>
                name:{' '}
                <Input
                  name={`friends/${index}/name`}
                  id={`friend-${index}-input`}
                />
              </div>
            )
          })}
        phone: <Input name="phone" check={isValidPhone} id="phone-input" />
      </div>
      <div>
        firstname: <p id="first-name-value">{state.user.name.first}</p>
        friends:{' '}
        {state &&
          state.friends &&
          state.friends.map((friend, index) => {
            return (
              <div key={index}>
                name: <p id={`friend-${index}-value`}>{friend.name}</p>
              </div>
            )
          })}
        phone:{' '}
        <p id="phone-value">{`${state.phone.value} ${
          state.phone.isWarn ? 'true' : 'false'
        } ${state.phone.isValid ? 'true' : 'false'}`}</p>
      </div>
    </div>
  )
}
