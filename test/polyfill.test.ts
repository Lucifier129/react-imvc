import '../polyfill/index'

interface NativeConsole extends Console {
  msIsIndependentlyComposed: Function
}

describe('polyfill', () => {
  it('console polyfill and work well', () => {
    expect((console as NativeConsole).msIsIndependentlyComposed).toBeDefined()
  })

  it('requestAnimationFrame polyfill and work well', () => {
    expect(window.requestAnimationFrame).toBeDefined()
  })
})