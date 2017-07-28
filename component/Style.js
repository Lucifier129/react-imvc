import React, { Component, PropTypes } from 'react'
import Preload from './Preload'

export default function Style ({ name }) {
  return <Preload as={PreloadStyle} name={name} />
}

// IE8 不支持用 React 的方式创建 style 标签，改用 InnerHTML
function PreloadStyle (props) {
  let html = {
  	__html: `<style type="text/css" data-preload="${props['data-preload']}">${props.children}</style>`
  }
  return (
    <div dangerouslySetInnerHTML={html} />
  )
}

// function PreloadStyle (props) {
//   return (
//     <style
//       type='text/css'
//       data-preload={props['data-preload']}
//       dangerouslySetInnerHTML={{ __html: props.children }}
//     />
//   )
// }
