import React from 'react'

export type RootCOntainerProps = Omit<
  React.JSX.IntrinsicElements['div'],
  'children'
> & {
  children: React.ReactNode | string
}

export default function RootContainer(props: RootCOntainerProps) {
  if (typeof props.children === 'string') {
    return (
      <div {...props} dangerouslySetInnerHTML={{ __html: props.children }} />
    )
  }

  return <div {...props}>{props.children}</div>
}
