import React from 'react'
import GlobalContext from '../context'
import { getValueByPath } from '../util'

export interface Transformer {
  <T>(currentValue?: T, oldValue?: T): T
}

export interface InputProps {
  as?: keyof HTMLElementTagNameMap
  type?: string
  name: string
  actionType?: string
  value?: string
  check?: ((value: string) => boolean) | boolean
  transformer?: Transformer
  [propName: string]: any
}

export default class Input extends React.Component<InputProps> {
  static contextType = GlobalContext
  static defaultProps = {
    as: 'input',
    type: 'text',
    name: '',
    actionType: 'UPDATE_INPUT_VALUE',
  }

  render() {
    let { state } = this.context
    let {
      as: tag,
      name,
      value,
      check,
      actionType,
      transformer,
      ...restSubProps
    } = this.props
    let subProps: Record<string, any> = restSubProps

    let path = check ? `${name}.value` : name

    if (value === void 0) {
      value = getValueByPath(state, path)
    }

    subProps.value = value
    subProps.name = name
    subProps.onChange = this.handleChange
    if (check) {
      subProps.onFocus = this.handleFocus
      subProps.onBlur = this.handleBlur
    }

    return React.createElement(tag ? tag : 'input', subProps)
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { state, handleInputChange } = this.context
    let { name, onChange, check, transformer } = this.props
    let currentValue: string = event.currentTarget.value
    let path: string = check ? `${name}.value` : name
    let oldValue: string = getValueByPath(state, path)

    if (typeof transformer === 'function') {
      currentValue = transformer(currentValue, oldValue)
    }

    if (handleInputChange) {
      currentValue = handleInputChange(path, currentValue, oldValue)
    }

    this.context.actions[
      this.props.actionType || Input.defaultProps.actionType
    ]({
      [path]: currentValue,
    })

    onChange && onChange(event)
  }

  handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    let { state } = this.context
    let { name, onFocus } = this.props
    let path: string = `${name}.isWarn`
    let isWarn: boolean = getValueByPath(state, path)
    if (!isWarn) {
      onFocus && onFocus(event)
      return
    }
    this.context.actions[
      this.props.actionType || Input.defaultProps.actionType
    ]({
      [path]: false,
    })
    onFocus && onFocus(event)
  }

  handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    let { name, onBlur, check } = this.props
    let pathOfValidState: string = `${name}.isValid`
    let pathOfWarnState: string = `${name}.isWarn`
    let isValidValue: boolean = (check as { (value: string): boolean })(
      event.currentTarget.value
    )
    this.context.actions[
      this.props.actionType || Input.defaultProps.actionType
    ]({
      [pathOfValidState]: isValidValue,
      [pathOfWarnState]: !isValidValue,
    })
    onBlur && onBlur(event)
  }
}
