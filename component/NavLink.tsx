import React from 'react'
import classnames from 'classnames'
import connect, { ConnectProps, ComponentProps } from '../hoc/connect'
import Link from './Link'
import IMVC from '../index'

const withLocation = connect(({ state }: ConnectProps) => {
  return {
    location: (state as IMVC.State).location
  }
})

export default withLocation(NavLink)

function NavLink({
  isActive: getIsActive,
  location,
  className,
  activeClassName,
  style,
  activeStyle,
  to,
  ...rest
}: ComponentProps) {
  let isActive = checkActive(getIsActive, to, location)
  let finalClassName = classnames(className, isActive && activeClassName)
  let finalStyle = isActive ? { ...style, ...activeStyle } : style
  return <Link to={to} className={finalClassName} style={finalStyle} {...rest} />
}

function checkActive(getIsActive: { (...args: any[]): boolean }, path: string, location: IMVC.Location) {
  return getIsActive
    ? !!getIsActive(path, location)
    : path === location.raw
}
