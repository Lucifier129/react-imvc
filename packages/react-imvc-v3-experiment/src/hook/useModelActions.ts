import useCtrl from './useCtrl'
import type Controller from '../controller'

export default function <S extends {} = {}, AS extends {} = {}>() {
  const { store } = useCtrl<Controller<S, AS>>()
  return store.actions
}
