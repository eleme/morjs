import React from 'react'

export function getString(content) {
  try {
    if (content === undefined || content == null) {
      return ''
    }
    // 如果是函数，那么直接返回函数
    if (typeof content === 'function') return content

    if (React.isValidElement(content)) {
      return content
    }
    return content.toString()
  } catch (err) {
    console.log(err)
    return ''
  }
}
