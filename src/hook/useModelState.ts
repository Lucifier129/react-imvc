import { BaseState } from '..'
import useCtrl from './useCtrl'

export default function<S extends BaseState>() {
  let ctrl = useCtrl<{}, S, {}>()
  return ctrl.store.getState()
}
