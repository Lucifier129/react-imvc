import useCtrl from './useCtrl'
import type Controller from '../controller'

export default function <S extends {}>() {
  let ctrl = useCtrl<Controller<S, any>>()
  return ctrl.store.getState()
}
