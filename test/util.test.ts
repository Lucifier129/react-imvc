import fetchMock from 'fetch-mock'
import fetch from 'node-fetch'
import util from '../util'

const defaultOption = {
  overwriteRoutes: true,
  fetch,
  fallbackToNetwork: true
}

describe('util test', () => {
  describe('toJSON', () => {
    it('toJSON return Promise resolve an object', async () => {
      fetchMock
      .mock('http://www.success1.com', { name: 'a' }, defaultOption)
      .sandbox()('http://www.success1.com')
      .then(res => {
        const json = util.toJSON(res)

        expect(typeof json.then).toBe('function')
        expect(json instanceof Promise).toBeTruthy()
  
        const obj = json.then()
  
        expect(typeof obj).toBe('object')
      })
      fetchMock.restore()
    })

    it('toJSON throw Error when response status is not normal', async () => {
      fetchMock
      .mock('http://www.error1.com', 400, defaultOption)
      .sandbox()('http://www.error1.com')
      .catch(e => {
        expect(util.toJSON(e)).toMatch(/error/ig)
      })
      fetchMock.restore()
    })
  })

  describe('toText', () => {
    it('toText return Promise resolve an object', async () => {
      fetchMock
      .mock('http://www.success2.com', 'a', defaultOption)
      .sandbox()('http://www.success2.com')
      .then(res => {
        const text = util.toText(res)

        expect(typeof text.then).toBe('function')
        expect(text instanceof Promise).toBeTruthy()
  
        const str = text.then()
  
        expect(typeof str).toBe('string')
      })
      fetchMock.restore()
    })
  
    it('toText throw Error when response status is not normal', async () => {
      fetchMock
      .mock('http://www.error2.com', 400, defaultOption)
      .sandbox()('http://www.error2.com')
      .catch(e => {
        expect(util.toText(e)).toMatch(/error/ig)
      })
      fetchMock.restore()
    })
  })

  describe('timeoutReject', () => {
    it('timeoutReject reject in time', () => {
      const callback = jest.fn()
      const promise = new Promise((resolve, reject) => {
        reject()
      })
      util
      .timeoutReject(promise, 3, null)
      .catch(() => callback())
      .then(() => callback())

      jest.advanceTimersByTime(1000);
      expect(callback).toHaveBeenLastCalledWith(expect.any(Function), 10000);
    })
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