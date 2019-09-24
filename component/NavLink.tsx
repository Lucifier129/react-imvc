import React from 'react'
import classnames from 'classnames'
import connect from '../hoc/connect'
import Link from './Link'
import { NativeLocation } from '../type'

const withLocation = connect(({ state }) => {
  return {
    location: state.location
  }
})

export default withLocation(NavLink)

interface Props {
  isActive: { (...args: any[]): boolean }
  location: NativeLocation
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

function checkActive(getIsActive: { (...args: any[]): boolean }, path: string, location: NativeLocation) {
  return getIsActive
    ? !!getIsActive(path, location)
    : path === location.raw
}
