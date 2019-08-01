import React from 'react'
import classnames from 'classnames'
import connect, { ConnectProps , ComponentProps } from '../hoc/connect'
import Link from './Link'
import { Location } from '../controller/types'

const withLocation = connect(({ state }: ConnectProps) => {
  return {
    location: state.location
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
  let isActive: boolean = checkActive(getIsActive, to, location)
  let finalClassName:string = classnames(className, isActive && activeClassName)
  let finalStyle: object = isActive ? { ...style, ...activeStyle } : style
  return <Link to={to} className={finalClassName} style={finalStyle} {...rest} />
}

function checkActive(getIsActive: { (...args: any[]): boolean }, path: string, location: Location): boolean {
  return getIsActive
    ? !!getIsActive(path, location)
    : path === location.raw
}
