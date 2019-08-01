import { Store } from './types'

export default function attachDevToolsIfPossible(store:Store) {
  if (process.env.NODE_ENV === "production") {
    return;
  }
  // @ts-ignore
  if (typeof window === "undefined" || !window.__REDUX_DEVTOOLS_EXTENSION__) {
    return;
  }

  const __FROM_REDUX_DEVTOOLS_EXTENSION__:string = "__FROM_REDUX_DEVTOOLS_EXTENSION__";

  let options:object = {
    name: window.location.pathname + window.location.search,
    actionsWhitelist: Object.keys(store.actions)
  };
  // @ts-ignore
  let reduxStore:Store = __REDUX_DEVTOOLS_EXTENSION__(
    store.getState,
    store.getState(),
    options
  );
  let isSync:boolean = false;
  store.subscribe((data: { [propName:string]: string }) => {
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
      store.replaceState(reduxStore.getState(), {
        actionType: __FROM_REDUX_DEVTOOLS_EXTENSION__,
        previousState: store.getState(),
        currentState: reduxStore.getState()
      });
    }
  });
}
