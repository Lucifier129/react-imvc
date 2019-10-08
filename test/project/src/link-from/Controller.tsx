import React from 'react'
import { Location, Context } from '../../../../type'
import Link from '../../../../component/Link'
import NavLink from '../../../../component/NavLink'
import Style from '../../../../component/Style'
import Controller from '../../../../controller'

export default class extends Controller<{}, {}, typeof View> {
  SSR = true // enable server side rendering
  View = View
  preload = {
    css: '/link-from/preload.css'
  }
  constructor(location: Location, context: Context) {
    super(location, context)
  }
}

function View() {
  return (
    <div id="link_from">
      <Style name="css" />
      link from page
      <Link id="link_to_link" to="/link_to">link to</Link>
      <NavLink id="nav_link_to_link" to="/link_to">link to</NavLink>
      <NavLink id="nav_link_from_link" to="/link_from" activeClassName="active" activeStyle={{
        fontSize: 14
      }}>link from</NavLink>
      <NavLink id="nav_link_to_link2" to="/link_to" activeClassName="active" activeStyle={{
        fontSize: 14
      }} isActive={(path, location) => true}>link to</NavLink>
    </div>
  )
}
