import { useContext } from 'react'
import GlobalContext from '../context'
import Controller from '../controller/index';

export default function useCtrl<Ctrl extends Controller>() {
  let { ctrl } = useContext(GlobalContext)
  return ctrl as Ctrl
}