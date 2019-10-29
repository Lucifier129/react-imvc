import { useContext } from 'react'
import GlobalContext from '../context'
import Controller from '../controller/index'

export default function useCtrl<Ctrl extends Controller<any, any>>() {
  type S = Ctrl extends Controller<infer S, any> ? S : never
  type AS = Ctrl extends Controller<any, infer AS> ? AS : never

  let { ctrl } = useContext(GlobalContext)
  return ctrl as Controller<S, AS>
}