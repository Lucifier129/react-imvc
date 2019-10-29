import useCtrl from './useCtrl'
import Controller from '../controller/index'

export default function<S extends {}, AS extends {}>() {
  let ctrl = useCtrl<Controller<S, AS>, S, AS>()
  return ctrl.store.getState()
}
