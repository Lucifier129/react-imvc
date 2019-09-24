import useCtrl from './useCtrl'
import Controller from '../controller'
import IMVC from '../type'

export default () => {
  let ctrl = useCtrl()
  return ctrl.store.getState()
}
