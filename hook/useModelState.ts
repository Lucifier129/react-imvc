import useCtrl from './useCtrl'
import Controller from '../controller'
import { State } from '../controller/types'

export default ():State => {
  let ctrl = useCtrl()
  return ctrl.store.getState()
}
