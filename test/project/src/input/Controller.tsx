import React from 'react'
import IMVC from '../../../../index'
import Controller from '../../../../controller'
import { Input } from '../../../../component'
import { Transformer } from '../../../../component/Input'

export default class extends Controller {
  SSR = true // enable server side rendering
  View = View
  initialState = {
    // 多层次对象
    user: {
      name: {
        first: '',
        last: '',
      },
      email: '',
      age: 0
    },
    // 数组对象
    friends: [{
      name: 'friendA',
    }, {
      name: 'friendB',
    }],
    // 复合对象
    phone: {
      value: '',
      isValid: false,
      isWarn: false,
    },
    content: ''
  }
  constructor(location: IMVC.Location, context: IMVC.Context) {
    super(location, context)
  }
}

function isValidPhone(value) {
  return /^[0-9]+$/ig.test(value)
}

function View({ state }) {
  return (
    <div id="input">
      input page
      <div>
        firstname: <Input name="user.name.first" id="first-name-input" />
        friends: {
          state.friends.map((friend, index) => {
            return (
              <div key={index}>
                name: <Input name={`friends/${index}/name`} id={`firend-${index}-input`} />
              </div>
            )
          })
        }
        phone: <Input name="phone" check={isValidPhone} id="phone-input"/>
      </div>
      <div>
        firstname: <p id="first-name-value">{state.user.name.first}</p>
        friends: {
          state.friends.map((friend, index) => {
            return (
              <div key={index}>
                name: <p id={`friend-${index}-value`}>{friend.name}</p>
              </div>
            )
          })
        }
        phone: <p id="phone-value">{`${state.phone.value} ${state.phone.isWarn ? 'true' : 'false'} ${state.phone.isValid ? 'true' : 'false'}`}</p>
      </div>
    </div>
  )
}
