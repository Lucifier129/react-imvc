import React from 'react'
import GlobalContext from '../context'
import { Preload } from '..'

export interface Props {
	name: string
}

export default function Style({ name }: Props) {
	return (
		<GlobalContext.Consumer>
			{({ preload }: { preload?: Preload }) => {
				return (
					<style
						type="text/css"
						data-preload={name}
						dangerouslySetInnerHTML={{ __html: preload ? preload[name] : '' }}
					/>
				)
			}}
		</GlobalContext.Consumer>
	)
}
