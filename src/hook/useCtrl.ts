import { useContext } from 'react'
import GlobalContext from '../context'
import Controller from '../controller/index'

export type StateFromCtrl<Ctrl extends Controller<any, any>> = Ctrl extends Controller<infer S, any> ? S : never
export type ASFromCtrl<Ctrl extends Controller<any, any>> = Ctrl extends Controller<any, infer AS> ? AS : never

export default function useCtrl<Ctrl extends Controller<any, any>>() {
  type State = StateFromCtrl<Ctrl>
  type Actions = ASFromCtrl<Ctrl>

  let { ctrl } = useContext(GlobalContext)
  return ctrl as Controller<State, Actions>
}