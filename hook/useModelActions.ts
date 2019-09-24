import useCtrl from './useCtrl'
import IMVC from '../type'

export default () => {
  let ctrl = useCtrl()
  return ctrl.store.actions
}
