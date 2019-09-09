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
  return true
}

function View({ state }) {
  return (
    <div id="input">
      input page
      <div>
        firstname: <Input name="user.name.first" id="first-name-input" />
        lastname: <Input name="user:name:last" id="last-name-input" />
        email: <Input name="user/email" id="email-input" />
        age: <Input name="user.age" transformer={Number as Transformer} id="age-input" />
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
        content: <Input as="textarea" name="content" id="content-input" />
      </div>
      <div>
        firstname: <p id="first-name-value">{state.user.name.first}</p>
        lastname: <p id="last-name-value">{state.user.name.last}</p>
        email: <p id="email-value" >{state.user.email}</p>
        age: <p id="age-value">{state.user.age}</p>
        friends: {
          state.friends.map((friend, index) => {
            return (
              <div key={index}>
                name: <p id={`friend-${index}-value`}></p>
              </div>
            )
          })
        }
        phone: <p id="phone-value">{state.phone}</p>
        content: <p id="content-value">{state.content}</p>
      </div>
    </div>
  )
}
