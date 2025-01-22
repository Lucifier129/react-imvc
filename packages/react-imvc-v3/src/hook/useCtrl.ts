import { useContext } from 'react'
import GlobalContext from '../context'
import type Controller from '../controller'

export default function useCtrl<Ctrl extends Controller<any, any>>() {
  let { ctrl } = useContext(GlobalContext)
  return ctrl as Ctrl
}
