import React from 'react'
import classnames from 'classnames'
import connect from '../hoc/connect'
import Link from './Link'
import { Location } from '..'

const withLocation = connect(({ state }) => {
  return {
    location: state.location
  }
})

export default withLocation(NavLink)

export interface Props {
  isActive?: { (...args: any[]): boolean }
  location: Location
  className?: string
  activeClassName?: string
	children?: React.ReactChild
  style?: object
  activeStyle?: object
  to: string
  [x: string]: any
}

function NavLink(props: Props) {
  let {
    isActive:  getIsActive,
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
  return <Link to={to} className={finalClassName} style={finalStyle} {...rest}>{children}</Link>
}

function checkActive(path: string, location: Location, getIsActive?: { (...args: any[]): boolean }) {
  return getIsActive
    ? !!getIsActive(path, location)
    : path === location.raw
}
