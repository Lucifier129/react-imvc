import React from 'react'
import GlobalContext from '../context'

export default function Style({ name }) {
    return (
        <GlobalContext.Consumer>
            {({ preload }) => {
                let content = preload[name]
                if (!content) return null
                return <style type="text/css" data-preload={name} dangerouslySetInnerHTML={{ __html: content }} />
            }}
        </GlobalContext.Consumer>
    )
}
