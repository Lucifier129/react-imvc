import { useContext } from 'react'
import GlobalContext from '../context'
import Controller from '../controller/index'

export type StateFromCtrl<Ctrl extends Controller<any, any>> = Ctrl extends Controller<infer S, any> ? S : never
export type ASFromCtrl<Ctrl extends Controller<any, any>> = Ctrl extends Controller<any, infer AS> ? AS : never

export default function useCtrl<Ctrl extends {}, S extends {}, AS extends {}>() {
  let { ctrl } = useContext(GlobalContext)
  return ctrl as Controller<S, AS> & Ctrl
}