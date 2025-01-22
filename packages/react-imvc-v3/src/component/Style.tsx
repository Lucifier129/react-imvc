import React from 'react'
import GlobalContext from '../context'
import type { Preload } from '..'

export interface StyleProps {
  name: string
}

export default function Style({ name }: StyleProps) {
  return (
    <GlobalContext.Consumer>
      {({ preload }: { preload?: Preload }) => {
        const content = preload && preload[name]
        if (!content) return null
        return (
          <style
            type="text/css"
            data-preload={name}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )
      }}
    </GlobalContext.Consumer>
  )
}
