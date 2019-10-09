import GlobalContext from '../src/context'

describe('context test', () => {
  it('context complete', () => {
    expect(GlobalContext.Consumer).toBeDefined()
    expect(GlobalContext.Provider).toBeDefined()
  })
})