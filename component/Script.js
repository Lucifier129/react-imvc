import React from 'react'
import { htmlEscapeJsonString } from '../util/htmlescape'

export default function Script(props) {
	let children = props.children || ''
	return (
		<script
			dangerouslySetInnerHTML={{
				__html: htmlEscapeJsonString(children)
			}}
		/>
	)
}
