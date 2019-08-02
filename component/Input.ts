import React from 'react'
import GlobalContext from '../context'
import _ from '../util'
import { Payload } from '../controller/types'

const { getValueByPath } = _

type Props = {
	as?: keyof HTMLElementTagNameMap
	type: string
	name: string
	actionType: string
	value?: string
	check?: { (value:string):boolean } | boolean
	transformer?: { (currentValue:string, oldValue:string):string}
	[propName: string]: any
}

export default class Input extends React.Component<Props> {
	static contextType:React.Context<any> = GlobalContext
	static defaultProps: Props = {
		as: 'input',
		type: 'text',
		name: '',
		actionType: 'UPDATE_INPUT_VALUE'
	}
	render():React.ReactNode {
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
		let subProps:{ [propName: string]: any } = restSubProps

		let path:string = check ? `${name}.value` : name

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

		return React.createElement(
			tag as keyof HTMLElementTagNameMap,
			subProps
		  )
	}
	getAction():{ (actionPayload: Payload):void } {
		return this.context.actions[this.props.actionType]
	}
	callAction(actionPayload: Payload):void {
		this.getAction()(actionPayload)
	}
	handleChange = (event: React.ChangeEvent<HTMLInputElement>):void => {
		let { state, handleInputChange } = this.context
		let { name, onChange, check, transformer } = this.props
		let currentValue:string = event.currentTarget.value
		let path:string = check ? `${name}.value` : name
		let oldValue:string = getValueByPath(state, path)

		if (typeof transformer === 'function') {
			currentValue = transformer(currentValue, oldValue)
		}

		if (handleInputChange) {
			currentValue = handleInputChange(path, currentValue, oldValue)
		}

		this.callAction({
			[path]: currentValue
		})

		onChange && onChange(event)
	}
	handleFocus = (event: React.FocusEvent<HTMLInputElement>):void => {
		let { state } = this.context
		let { name, onFocus } = this.props
		let path:string = `${name}.isWarn`
		let isWarn:boolean = getValueByPath(state, path)
		if (!isWarn) {
			onFocus && onFocus(event)
			return
		}
		this.callAction({
			[path]: false
		})
		onFocus && onFocus(event)
	}
	handleBlur = (event: React.FocusEvent<HTMLInputElement>):void => {
		let { name, onBlur, check } = this.props
		let pathOfValidState:string = `${name}.isValid`
		let pathOfWarnState:string = `${name}.isWarn`
		let isValidValue:boolean = (check as { (value:string):boolean })(event.currentTarget.value)
		this.callAction({
			[pathOfValidState]: isValidValue,
			[pathOfWarnState]: !isValidValue
		})
		onBlur && onBlur(event)
	}
}
