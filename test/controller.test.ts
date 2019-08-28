import Controller from '../controller'
import * as Actions from '../controller/actions'
import attachDevToolsIfPossible from '../controller/attachDevToolsIfPossible'
import { createStore } from 'relite'
import IMVC from '../index';

describe('controller test', () => {
  describe('Actions', () => {
    describe('INDENTITY', () => {
      it('result is a obj is the same with which passed in', () => {
        let obj = {
          a: 1,
          b: '2',
          c: true
        }
        let result = Actions.INDENTITY(obj)
    
        expect(result).toBe(obj)
      })
    })
    
    describe('UPDATE_STATE', () => {
      it('the result contains all attributes in old state and new state', () => {
        let oldState = {
          a: 1,
          b: 'a',
          c: () => {
            return 'c'
          },
          d: {
            a: "a"
          },
          e: true
        }
        let newState = {
          f: 2,
          g: 'g',
          h: () => {
            return 'h'
          }
        }
        let result = Actions.UPDATE_STATE(oldState, newState)
    
        expect(typeof result).toBe('object')
        expect(result.a).toBe(1)
        expect(result.b).toBe('a')
        expect(typeof result.c).toBe('function')
        expect(result.c()).toBe('c')
        expect(result.e).toBe(true)
        expect(result.f).toBe(2)
        expect(result.g).toBe('g')
        expect(typeof result.h).toBe('function')
        expect(result.h()).toBe('h')
      })
  
      it('the attributes in new state will cover the attributes in old has the same key', () => {
        let oldState = {
          a: 1,
          b: 2
        }
        let newState = {
          a: 2,
          b: '2'
        }
        let result = Actions.UPDATE_STATE(oldState, newState)
  
        expect(result.a).toBe(2)
        expect(result.b).toBe('2')
      })
    })
    
    describe('__PAGE_DID_BACK__', () => {
      it('add new attribute \'location\' into state', () => {
        let oldState = {
          basename: 'test',
          a: 1,
          b: 'a',
          c: () => {
            return 'c'
          },
          d: {
            a: "a"
          },
          e: true
        }
        let location = {}
        let result = Actions.__PAGE_DID_BACK__(oldState, location)
    
        expect(typeof result).toBe('object')
        expect(result.a).toBe(1)
        expect(result.b).toBe('a')
        expect(typeof result.c).toBe('function')
        expect(result.c()).toBe('c')
        expect(result.e).toBe(true)
        expect(typeof result.location).toBe('object')
      })

      it('new location will cover old location attribute', () => {
        let oldState = {
          location: {
            basename: 'test1'
          }
        }
        let location = {
          basename: 'test2'
        }
        let state = Actions.__PAGE_DID_BACK__(oldState, location)

        expect(state).not.toBeUndefined()
        expect(state.location).not.toBeUndefined()
        expect(state.location.basename).toBe('test2')
      })
    })
  
    describe('UPDATE_STATE_BY_PATH', () => {
      it('It worked. add attributes in payload to state', () => {
        let state = {}
        let payload = {
          jack: 2,
          home: 'home',
          example: true
        }
        let result = Actions.UPDATE_INPUT_VALUE(state, payload)

        expect(typeof result).toBe('object')
        expect(result.jack).toBe(2)
        expect(result.home).toBe('home')
        expect(result.example).toBe(true)
      })
    })
  
    describe('UPDATE_INPUT_VALUE', () => {
      let state = {}
      let payload = {
        jack: 2,
        home: 'home',
        example: true
      }
      let result = Actions.UPDATE_INPUT_VALUE(state, payload)

      expect(typeof result).toBe('object')
      expect(result.jack).toBe(2)
      expect(result.home).toBe('home')
      expect(result.example).toBe(true)
    })
  })
  
  describe('attachDevToolIfPossible', () => {
    it('production env. return void without doing any thing', () => {
      let actions = {
        AAAA: (state) => {
          return state
        }
      }
      
      let store: IMVC.Store = createStore(actions)
      console.log(store)
      attachDevToolsIfPossible(store)

    })

    it('Not progress in browser. return void without doing any thing', () => {
      let store = {}
      let result = attachDevToolsIfPossible(store)

    })
  })
  
  describe('controller', () => {
  
  })
  
})