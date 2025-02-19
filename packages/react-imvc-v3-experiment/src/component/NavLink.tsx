import React from 'react'
import classnames from 'classnames'
import Link from './Link'
import connect from '../hoc/connect'
import type { BaseLocation } from 'create-history'
import type { Location } from '..'

const withLocation = connect(({ state }) => {
  return {
    location: state.location,
  }
})

export default withLocation(NavLink)

export interface NavLinkProps {
  isActive?: { (...args: any[]): boolean }
  location: Location
  className?: string
  activeClassName?: string
  children?: React.ReactChild
  style?: object
  activeStyle?: object
  to: string | BaseLocation
  [x: string]: any
}

export interface GetIsActive {
  (path: string | BaseLocation, location: Location): boolean
}

function NavLink(props: NavLinkProps) {
  let {
    isActive: getIsActive,
    location,
    className,
    children,
    activeClassName,
    style,
    activeStyle,
    to,
    ...rest
  } = props
  let isActive = checkActive(to, location, getIsActive)
  let finalClassName = classnames(className, isActive && activeClassName)
  let finalStyle = isActive ? { ...style, ...activeStyle } : style
  return (
    <Link to={to} className={finalClassName} style={finalStyle} {...rest}>
      {children}
    </Link>
  )
}

function checkActive(
  path: string | BaseLocation,
  location: Location,
  getIsActive?: GetIsActive
) {
  return getIsActive ? !!getIsActive(path, location) : path === location.raw
}
