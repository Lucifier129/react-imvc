import useCtrl from './useCtrl'
import IMVC from '../index'

export default () => {
  let ctrl = useCtrl()
  return ctrl.store.actions
}
