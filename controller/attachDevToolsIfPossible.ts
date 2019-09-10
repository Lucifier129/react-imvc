import IMVC from "../index"

interface AttachDevToolsIfPossible {
  (store: IMVC.Store): void
}

const attachDevToolsIfPossible: AttachDevToolsIfPossible = store => {
  if (process.env.NODE_ENV === "production") {
    return
  }
  if (typeof window === "undefined" || !window.__REDUX_DEVTOOLS_EXTENSION__) {
    return
  }

  const __FROM_REDUX_DEVTOOLS_EXTENSION__ = "__FROM_REDUX_DEVTOOLS_EXTENSION__"

  let options = {
    name: window.location.pathname + window.location.search,
    actionsWhitelist: Object.keys(store.actions)
  }
  let reduxStore = __REDUX_DEVTOOLS_EXTENSION__(
    store.getState,
    store.getState(),
    options
  )
  let isSync = false;
  store.subscribe((data: IMVC.Data) => {
    if (!data || data.actionType === __FROM_REDUX_DEVTOOLS_EXTENSION__) {
      return
    }
    isSync = true
    reduxStore.dispatch({
      type: data.actionType, 
      payload: data.actionPayload
    })
    isSync = false
  })

  reduxStore.subscribe(() => {
    if (!isSync) {
      store.replaceState(reduxStore.getState(), {
        actionType: __FROM_REDUX_DEVTOOLS_EXTENSION__,
        actionPayload: {},
        previousState: store.getState(),
        currentState: reduxStore.getState(),
        start: new Date(),
        end: new Date()
      })
    }
  })
}

export default attachDevToolsIfPossible
