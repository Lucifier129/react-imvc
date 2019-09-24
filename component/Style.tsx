import React from 'react'
import GlobalContext from '../context'
import IMVC from '../type'

interface Props {
	name: string
}

export default function Style({ name }: Props) {
	return (
		<GlobalContext.Consumer>
			{({ preload }: { preload?: IMVC.Preload }) => {
				return (
					<style
						type="text/css"
						data-preload={name}
						dangerouslySetInnerHTML={{ __html: (preload as IMVC.Preload)[name] }}
					/>
				)
			}}
		</GlobalContext.Consumer>
	)
}
