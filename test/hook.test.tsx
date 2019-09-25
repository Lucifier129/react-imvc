import React from 'react'
import {
  useCtrl,
  useModel,
  useModelActions,
  useModelState
} from '../hook'

describe('hook', () => {
  describe('useCtrl', () => {
    it('it work well', () => {
      const Test = () => {
        let context = React.createContext({
          a: test
        })
        let ctrl = useCtrl()

        return <div>test</div>
      }

    })
  })
  
  // describe('useModel', () => {
    
  // })
  
  // describe('useModelActions', () => {
    
  // })
  
  // describe('useModelState', () => {
    
  // })
})