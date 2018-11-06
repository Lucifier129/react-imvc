import React from 'react'
import GlobalContext from '../context'

export default function Style({ name }) {
	return (
		<GlobalContext.Consumer>
			{({ preload }) => {
				return (
					<style
						type="text/css"
						data-preload={name}
						dangerouslySetInnerHTML={{ __html: preload[name] }}
					/>
				)
			}}
		</GlobalContext.Consumer>
	)
}
