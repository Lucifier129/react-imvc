import { useContext } from 'react'
import GlobalContext from '../context'

export default (): any => {
  let { ctrl } = useContext(GlobalContext) as { ctrl: any }
  return ctrl
}