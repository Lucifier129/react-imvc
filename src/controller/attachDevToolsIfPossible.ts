import RIMVC from '../index'

interface AttachDevToolsIfPossible {
  (store: RIMVC.Store): void
}

const attachDevToolsIfPossible: AttachDevToolsIfPossible = (store) => {
  if (process.env.NODE_ENV === "production") {
    return;
  }
  // @ts-ignore
  if (typeof window === "undefined" || !window.__REDUX_DEVTOOLS_EXTENSION__) {
    return;
  }

  const __FROM_REDUX_DEVTOOLS_EXTENSION__ = "__FROM_REDUX_DEVTOOLS_EXTENSION__";

  let options = {
    name: window.location.pathname + window.location.search,
    actionsWhitelist: Object.keys(store.actions as RIMVC.Actions)
  };
  // @ts-ignore
  let reduxStore:Store = __REDUX_DEVTOOLS_EXTENSION__(
    store.getState,
    (store.getState as Function)(),
    options
  );
  let isSync = false;
  (store.subscribe as Function)((data: Record<string, string>) => {
    if (!data || data.actionType === __FROM_REDUX_DEVTOOLS_EXTENSION__) {
      return;
    }
    isSync = true;
    reduxStore.dispatch({
      type: data.actionType,
      payload: data.actionPayload
    });
    isSync = false;
  });

  reduxStore.subscribe(() => {
    if (!isSync) {
      (store.replaceState as Function)(reduxStore.getState(), {
        actionType: __FROM_REDUX_DEVTOOLS_EXTENSION__,
        previousState: (store.getState as Function)(),
        currentState: reduxStore.getState()
      });
    }
  });
}

export default attachDevToolsIfPossible