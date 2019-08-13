import React from 'react'
import GlobalContext from '../context'
import RIMVC from '../index'

interface Props {
	name: string
}

export default function Style({ name }: Props) {
	return (
		<GlobalContext.Consumer>
			{({ preload }: { preload?: RIMVC.Preload }) => {
				return (
					<style
						type="text/css"
						data-preload={name}
						dangerouslySetInnerHTML={{ __html: (preload as RIMVC.Preload)[name] }}
					/>
				)
			}}
		</GlobalContext.Consumer>
	)
}
