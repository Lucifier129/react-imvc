import useCtrl from './useCtrl'
import Controller from '../controller'
import { Actions } from '../controller/types'

export default ():Actions => {
  let ctrl = useCtrl()
  return ctrl.store.actions
}
