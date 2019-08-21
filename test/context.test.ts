import GlobalContext from '../context'

describe('context test', () => {
  it('context complete', () => {
    expect(GlobalContext.Consumer).toBeDefined()
    expect(GlobalContext.Provider).toBeDefined()
  })
})