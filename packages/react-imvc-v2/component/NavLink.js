import React from 'react'
import classnames from 'classnames'
import connect from '../hoc/connect'
import Link from './Link'

const withLocation = connect(({ state }) => {
    return {
        location: state.location,
    }
})

export default withLocation(NavLink)

function NavLink({ isActive: getIsActive, location, className, activeClassName, style, activeStyle, to, ...rest }) {
    let isActive = checkActive(getIsActive, to, location)
    let finalClassName = classnames(className, isActive && activeClassName)
    let finalStyle = isActive ? { ...style, ...activeStyle } : style
    return <Link to={to} className={finalClassName} style={finalStyle} {...rest} />
}

function checkActive(getIsActive, path, location) {
    return getIsActive ? !!getIsActive(path, location) : path === location.raw
}
