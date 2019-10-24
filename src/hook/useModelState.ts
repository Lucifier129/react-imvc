import { BaseState } from '..'
import useCtrl from './useCtrl'

export default function<S extends BaseState>() {
  let ctrl = useCtrl()
  return ctrl.store.getState() as S
}
