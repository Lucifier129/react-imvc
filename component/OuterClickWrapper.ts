import React, { Component, Children } from 'react'
import { findDOMNode } from 'react-dom'

type Props = {
  onClick?: Function
  children?: React.ReactNode
}

export default class OuterClickWrapper extends Component<Props> {
  componentDidMount():void {
    if (document.addEventListener) {
      document.addEventListener('click', this.handleOutterClick)
      //@ts-ignore
    } else if (document.attachEvent) {
      //@ts-ignore
      document.attachEvent('onclick', this.handleOutterClick)
    }
  }
  componentWillUnmount():void {
    if (document.removeEventListener) {
      document.removeEventListener('click', this.handleOutterClick)
      //@ts-ignore
    } else if (document.detachEvent) {
      //@ts-ignore
      document.detachEvent('onclick', this.handleOutterClick)
    }
  }
  // 结点是否包含结点
  contains(rootNode: Element | Text, node: Node | null):boolean {
    if (typeof rootNode.contains === 'function') {
      return rootNode.contains(node)
    }
    while (node) {
      if (node === rootNode) {
        return true
      }
      node = node.parentNode
    }
    return false
  }
  handleOutterClick = (event: Event):void => {
    let { onClick } = this.props
    if (!onClick) {
      return
    }
    let root: Element | Text | null = findDOMNode(this)
    let isContains:boolean = this.contains(root as Element | Text, (event.target || event.srcElement) as Node | null)
    if (!isContains) {
      onClick(event)
    }
  };
  render ():React.ReactNode {
    return Children.only(this.props.children)
  }
}
