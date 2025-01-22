import React from 'react'
import Script from '../../src/component/Script'
import { RenderProps } from '../../src/'

export default function Page(props: RenderProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, minimal-ui"
        />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta content="black" name="apple-mobile-web-app-status-bar-style" />
        <title>{props.title}</title>
        <meta name="description" content={props.description} />
        <meta name="keywords" content={props.keywords} />
      </head>
      <body>
        <img src={props.publicPath + '/img/react.png'} alt="" />
        <div id="root" dangerouslySetInnerHTML={{ __html: props.content }} />
        <div id="modal" />
        <Script>{`
        (function() {
          window.__INITIAL_STATE__ = ${JSON.stringify(props.initialState)}
          window.__APP_SETTINGS__ = ${JSON.stringify(props.appSettings)}
          window.__PUBLIC_PATH__ = '${props.publicPath}'
          window.__CUSTOM_LAYOUT__ = true
        })()
      `}</Script>
        <script src={`${props.publicPath}/${props.assets.vendor}`} />
        <script src={`${props.publicPath}/${props.assets.index}`} />
      </body>
    </html>
  )
}
