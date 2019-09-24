import React, { Component, Children } from 'react'
import { findDOMNode } from 'react-dom'

interface Props {
  onClick?: Function
  children?: React.ReactNode
}

export default class OuterClickWrapper extends Component<Props> {
  componentDidMount() {
    if (document.addEventListener) {
      document.addEventListener('click', this.handleOutterClick)
    } else if (document.attachEvent) {
      document.attachEvent('onclick', this.handleOutterClick)
    }
  }

  componentWillUnmount() {
    if (document.removeEventListener) {
      document.removeEventListener('click', this.handleOutterClick)
    } else if (document.detachEvent) {
      document.detachEvent('onclick', this.handleOutterClick)
    }
  }

  // 结点是否包含结点
  contains(rootNode: Element | Text, node: Node & ParentNode) {
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

  handleOutterClick = (event: Event) => {
    let { onClick } = this.props
    if (!onClick) {
      return
    }
    let root = findDOMNode(this)
    let isContains = root && (event.target || event.srcElement) && this.contains(root, (event.target || event.srcElement) as Node & ParentNode)
    if (!isContains) {
      onClick(event)
    }
  }
  
  render() {
    return Children.only(this.props.children)
  }
}
