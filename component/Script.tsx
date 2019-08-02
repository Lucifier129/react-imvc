import React from 'react'

type Props = {
	children: string
}

export default function Script(props: Props):JSX.Element {
	let children:string = props.children || ''
	return (
		<script
			dangerouslySetInnerHTML={{
				__html: children.replace(/<\/script/gi, '&lt/script')
			}}
		/>
	)
}
