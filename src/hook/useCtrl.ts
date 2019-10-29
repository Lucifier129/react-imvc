import { useContext } from 'react'
import GlobalContext from '../context'
import Controller from '../controller/index'

export default function useCtrl<Ctrl extends Controller<any, any>>() {
  let { ctrl } = useContext(GlobalContext)
  return ctrl as unknown as Ctrl
}