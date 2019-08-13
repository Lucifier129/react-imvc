import React from 'react'

interface Props {
	children: string
}

export default function Script(props: Props) {
	let children = props.children || ''
	return (
		<script
			dangerouslySetInnerHTML={{
				__html: children.replace(/<\/script/gi, '&lt/script')
			}}
		/>
	)
}
