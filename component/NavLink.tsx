import React from 'react'
import classnames from 'classnames'
import connect from '../hoc/connect'
import Link from './Link'
import IMVC from '../type'

const withLocation = connect(({ state }) => {
  return {
    location: (state as IMVC.State).location
  }
})

export default withLocation(NavLink)

interface Props {
  isActive?: { (...args: any[]): boolean }
  location?: IMVC.Location
  className?: string
  activeClassName?: string
  style?: object
  activeStyle?: object
  to: string
  [x: string]: any
}

function NavLink({
  isActive: getIsActive,
  location,
  className,
  activeClassName,
  style,
  activeStyle,
  to,
  ...rest
}: Props) {
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
