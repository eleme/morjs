import { rpxToRem } from './rpx'
// 根据字符串创建样式对象
export function createStyle(style: string | Record<string, any>) {
  if (typeof style === 'string') {
    const styleObj = {}
    const styleObjMap = style
      .split(';')
      .map((t) => t.trim())
      .filter((t) => t)
    styleObjMap.forEach((stylePart, index) => {
      const stylePartArr = stylePart.split(':').map((t) => t.trim())
      const [key, ...valueParts] = stylePartArr
      const value = valueParts && valueParts.join(':')

      if (!key || key.endsWith('-')) {
        throw new Error('parse style error: "' + stylePart + '" in ' + style)
      }

      // css 自定义变量不转换为驼峰
      const upCaseKey = key.startsWith('--')
        ? key
        : key.replace(/[-\s]+(.)?/g, (m, w) => (w ? w.toUpperCase() : ''))
      // 数组商都小于2的情况写，非正常key value键值对，判断去除
      if (stylePartArr.length >= 2) {
        // 如果下一个键值对小于2的情况下，判断value为上一个样式属性value被分号进行切割遗留，如：url(data:image/png;base64,iVBORw0KGgo...)
        if (
          index < styleObjMap.length - 1 &&
          styleObjMap[index + 1] &&
          styleObjMap[index + 1].split(':').length < 2
        ) {
          styleObj[upCaseKey] = `${value};${styleObjMap[index + 1]}`
        } else {
          styleObj[upCaseKey] = value
        }
      }
    })
    style = styleObj
  }

  if (typeof style === 'object') {
    // 进行rpx 转换
    for (const key in style) {
      const value = style[key]
      if (typeof value === 'string' && value.indexOf('rpx') > 0) {
        const reg = /(\d*\.?\d+)rpx/g
        let temp = value
        let r
        do {
          r = reg.exec(temp)
          if (r) {
            temp =
              temp.substring(0, r.index) +
              rpxToRem(parseFloat(r[0])) +
              temp.substring(r.index + r[0].length)
          }
        } while (r)
        style[key] = temp
      }
    }
  }

  // 逻辑走到这里, 如果 style 不是对象, 直接返回空对象
  // 避免 react 报错
  // 原因: react 的 inline style 只能接收对象
  else {
    return {}
  }

  return style
}
