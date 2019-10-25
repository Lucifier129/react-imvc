import { Actions } from 'relite'
import { BaseState } from '..'
import useCtrl from './useCtrl'

export default function<S extends BaseState, AS extends Actions<S>>() {
  let ctrl = useCtrl<{}, S, AS>()
  return ctrl.store.actions
}
