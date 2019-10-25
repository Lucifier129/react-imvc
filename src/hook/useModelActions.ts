import { Actions, Currings } from 'relite'
import { BaseState, BaseActions } from '..'
import useCtrl from './useCtrl'

export default function<S extends BaseState, AS extends Actions<S>>() {
  let ctrl = useCtrl<{}, S, AS>()
  return ctrl.store.actions
}
