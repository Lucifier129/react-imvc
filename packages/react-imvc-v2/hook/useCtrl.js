import { useContext } from 'react'
import GlobalContext from '../context'

export default () => {
    let { ctrl } = useContext(GlobalContext)
    return ctrl
}
