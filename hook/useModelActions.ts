import useCtrl from './useCtrl'
import IMVC from '../index'

export default (): IMVC.Actions | undefined => {
  let ctrl = useCtrl()
  return ctrl.store.actions
}
