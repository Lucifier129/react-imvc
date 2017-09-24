import React from "react";
import Preload from "./Preload";

export default function Style({ name }) {
  return <Preload as={PreloadStyle} name={name} />;
}

const styleMap = {};
class PreloadStyle extends React.PureComponent {
  hadRendered = false
  componentWillUnmount() {
    if (this.hadRendered) {
      delete styleMap[this.props.children]
    }
  }
  render() {
    if (!this.hadRendered && styleMap[this.props.children]) { // 只渲染一次相同内容
      return null;
    }
    this.hadRendered = styleMap[this.props.children] = true
    // IE8 不支持用 React 的方式创建 style 标签，改用 InnerHTML
    let html = {
      __html: `<style type="text/css" data-preload="${this.props["data-preload"]}">${this.props.children}</style>`
    };
    return <div dangerouslySetInnerHTML={html} />;
  }
}
