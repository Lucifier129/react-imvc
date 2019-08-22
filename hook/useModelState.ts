import useCtrl from './useCtrl'
import Controller from '../controller'
import IMVC from '../index'

export default (): IMVC.State => {
  let ctrl = useCtrl()
  return (ctrl.store.getState as Function)()
}
