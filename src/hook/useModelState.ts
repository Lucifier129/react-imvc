import useCtrl from './useCtrl'
import Controller from '../controller/index'

export default function<Ctrl extends Controller<any, any>>() {
  let ctrl = useCtrl<Ctrl>()
  return ctrl.store.getState()
}
