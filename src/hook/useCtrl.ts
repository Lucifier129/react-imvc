import { useContext } from 'react'
import { Actions } from 'relite'
import { BaseState } from '..'
import GlobalContext from '../context'
import Controller from '../controller/index';

export default function useCtrl<Ctrl extends object, S extends BaseState, AS extends Actions<S>>() {
  let { ctrl } = useContext(GlobalContext)
  return ctrl as Controller<S, AS> & Ctrl
}