import useCtrl from './useCtrl'

export default () => {
    let ctrl = useCtrl()
    return ctrl.store.actions
}
