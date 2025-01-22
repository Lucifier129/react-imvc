import React from 'react'

export default function Script(props) {
    let children = props.children || ''
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: children.replace(/<\/script/gi, '&lt/script'),
            }}
        />
    )
}
