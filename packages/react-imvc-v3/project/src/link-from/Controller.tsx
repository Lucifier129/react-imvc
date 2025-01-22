import React from 'react'
import { Location, Context } from '../../../src/'
import Link from '../../../src/component/Link'
import NavLink from '../../../src/component/NavLink'
import Style from '../../../src/component/Style'
import Controller from '../../../src/controller'
import { useModelState } from '../../../src/hook'
import style from './preload.css'

export default class extends Controller<{}, {}> {
  SSR = this.location.query.ssr !== '0'
  View = View
  preload = {
    css: style,
  }
  constructor(location: Location, context: Context) {
    super(location, context)
  }
  publicPathPlaceholder = '#public_path'
}

function View() {
  const state = useModelState()
  return (
    <div id="link_from">
      <Style name="css" />
      link from page
      <Link id="link_to_link" to="/link_to">
        link to
      </Link>
      <NavLink id="nav_link_to_link" to="/link_to">
        link to
      </NavLink>
      <NavLink
        id="nav_link_from_link"
        to="/link_from"
        activeClassName="active"
        activeStyle={{
          fontSize: 14,
        }}
      >
        link from
      </NavLink>
      <NavLink
        id="nav_link_to_link2"
        to="/link_to"
        activeClassName="active"
        activeStyle={{
          fontSize: 14,
        }}
        isActive={() => true}
      >
        link to
      </NavLink>
      <img src={state.publicPath + '/img/happy.svg'} />
      <div className="inactive" style={{ width: 915, height: 601 }} />
    </div>
  )
}
