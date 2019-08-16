import fm from 'fetch-mock'
import util from '../util'

const nodeFetch = jest.requireActual('node-fetch');
const fetchMock = fm.sandbox();
Object.assign(fetchMock.config, nodeFetch, {
  fetch: nodeFetch
});

describe('util test', () => {
  describe('toJSON', () => {
    it('toJSON return Promise resolve an object', async () => {
      fetchMock.mock('http://www.mock.com', 200)
      const res = await fetch('http://www.mock.com')
      const json = util.toJSON(res)
      expect(typeof json.then).toBe('function')
      expect(json instanceof Promise).toBeTruthy()

      const obj = json.then()
      expect(typeof obj).toBe('object')
    })
  
    it('toJSON throw Error when response status is not normal', async () => {
      const res = await fetch('localhost:300000')
      expect(util.toJSON(res)).toMatch(/error/ig)
    })
  })

  describe('toText', () => {
    it('toText return Promise resolve an object', async () => {
      let res = await fetch('http://www.baidu.com')
      let text = util.toText(res)
      expect(typeof text.then).toBe('function')
      expect(text instanceof Promise).toBeTruthy()

      let obj = text.then()
      expect(typeof obj).toBe('object')
    })
  
    it('toText throw Error when response status is not normal', async () => {
      fetch('localhost:300000')
        .catch(e => expect(e.toString()).toMatch(/error/ig))

    })
  })

  describe('timeoutReject', () => {

  })
  
  describe('isAbsoluteUrl', () => {

  })
  
  describe('mapValues', () => {

  })
  
  describe('isThenable', () => {

  })
  
  describe('setValueByPath', () => {

  })
  
  describe('getValueByPath', () => {

  })
  
  describe('getFlatList', () => {

  })
})