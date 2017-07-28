/**
 * 基于不可变状态的时间旅行记录器
 */

export default function setRecorder (store) {
  let states = []
  let index = 0

  function add (state) {
    states.push(state)
    index = states.length - 1
  }

  function clear (state) {
    states = []
    index = 0
  }

  function slice (start, end) {
    states = state.slice(start, end)
    index = state.length ? state.length - 1 : 0
  }

  function getStates () {
    return states
  }

  function getState () {
    return states[index]
  }

  function goTo (i) {
    let length = states.length
    if (i >= 0 && i <= length - 1) {
      index = i
      replaceState()
    }
  }

  function back () {
    goTo(index - 1)
  }

  function forward () {
    goTo(index + 1)
  }

  function replaceState () {
    let state = getState()
    let time = new Date()
    store.replaceState(state, {
      isAsync: false,
      start: time,
      end: time,
      actionType: '__RECORD_ACTION__',
      previousState: store.getState(),
      currentState: state
    })
  }

  store.subscribe(({ currentState, actionType }) => {
    if (actionType === '__RECORD_ACTION__') {
      return
    }
    add(currentState)
  })

  add(store.getState())

  let recorder = {
    add,
    clear,
    slice,
    getStates,
    back,
    forward,
    goTo
  }
  window.recorder = recorder
}
