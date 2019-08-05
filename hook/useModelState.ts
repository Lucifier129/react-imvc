import useCtrl from './useCtrl'
import Controller from '../controller'

export default () => {
  let ctrl:Controller = useCtrl()
  return ctrl.store.getState()
}
