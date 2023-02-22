import React from 'react'

// block组件，本身不是UI元素，而是仅仅会把子元素渲染出来
export class Block extends React.PureComponent {
  override render() {
    return this.props.children || false
  }
}
