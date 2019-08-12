import { useContext } from 'react'
import GlobalContext from '../context'
import Controller from '../controller'

export default ():Controller => {
  let { ctrl } = useContext(GlobalContext) as { ctrl: Controller }
  return ctrl
}