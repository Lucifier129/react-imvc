import React from 'react'
import GlobalContext from '../context'
import _ from '../util'

const { getValueByPath } = _

export default class Input extends React.Component {
    static contextType = GlobalContext
    static defaultProps = {
        as: 'input',
        type: 'text',
        name: '',
        actionType: 'UPDATE_INPUT_VALUE',
    }
    render() {
        let { state } = this.context
        let { as, name, value, check, actionType, transformer, ...subProps } = this.props
        let Tag = as

        let path = check ? `${name}.value` : name

        if (value === undefined) {
            value = getValueByPath(state, path)
        }

        subProps.value = value
        subProps.name = name
        subProps.onChange = this.handleChange
        if (check) {
            subProps.onFocus = this.handleFocus
            subProps.onBlur = this.handleBlur
        }

        return <Tag {...subProps} />
    }
    getAction() {
        return this.context.actions[this.props.actionType]
    }
    callAction(actionPayload) {
        this.getAction()(actionPayload)
    }
    handleChange = (event) => {
        let { state, handleInputChange } = this.context
        let { name, onChange, check, transformer } = this.props
        let currentValue = event.currentTarget.value
        let path = check ? `${name}.value` : name
        let oldValue = getValueByPath(state, path)

        if (typeof transformer === 'function') {
            currentValue = transformer(currentValue, oldValue)
        }

        if (handleInputChange) {
            currentValue = handleInputChange(path, currentValue, oldValue)
        }

        this.callAction({
            [path]: currentValue,
        })

        onChange && onChange(event)
    }
    handleFocus = (event) => {
        let { state } = this.context
        let { name, onFocus } = this.props
        let path = `${name}.isWarn`
        let isWarn = getValueByPath(state, path)
        if (!isWarn) {
            onFocus && onFocus(event)
            return
        }
        this.callAction({
            [path]: false,
        })
        onFocus && onFocus(event)
    }
    handleBlur = (event) => {
        let { name, onBlur, check } = this.props
        let pathOfValidState = `${name}.isValid`
        let pathOfWarnState = `${name}.isWarn`
        let isValidValue = check(event.currentTarget.value)
        this.callAction({
            [pathOfValidState]: isValidValue,
            [pathOfWarnState]: !isValidValue,
        })
        onBlur && onBlur(event)
    }
}
