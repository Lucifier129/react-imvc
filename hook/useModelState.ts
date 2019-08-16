import useCtrl from './useCtrl'
import Controller from '../controller'
import RIMVC from '../index'

export default (): RIMVC.State => {
  let ctrl = useCtrl()
  return (ctrl.store.getState as Function)()
}
