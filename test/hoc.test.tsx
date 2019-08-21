import React from 'react'
import connect from '../hoc/connect'

describe('hoc test', () => {
  describe('connect', () => {
    it('the props of inputed component contain global data', () => {
      const testCompoent = ({ location }) => {
        return <div>{location}</div>
      }
      const selector = () => {
        return {
          location: 'test'
        }
      }
      const withLocation = connect(selector)
      const connectedComponent = withLocation(testCompoent)
    })
  })
})