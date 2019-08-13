import useCtrl from './useCtrl'
import RIMVC from '../index'

export default (): RIMVC.Actions | undefined => {
  let ctrl = useCtrl()
  return ctrl.store.actions
}
