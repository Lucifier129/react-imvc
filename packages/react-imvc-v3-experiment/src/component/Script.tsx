import React from 'react'

export interface ScriptProps {
  children: string
}

export default function Script({ children = '' }: ScriptProps) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: children.replace(/<\/script/gi, '&lt/script'),
      }}
    />
  )
}
