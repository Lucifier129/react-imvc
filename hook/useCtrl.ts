import { useContext } from 'react'
import GlobalContext from '../context'
import Controller from '../controller';

export default (): any => {
  let { ctrl } = useContext(GlobalContext) as {
    ctrl: Controller
  }
  return ctrl
}