export function getRelativePath(path) {
  // 文件路径 包含相对、绝对路径
  // ../../test/a.img => ./test/a.img
  // NOTE: 这里不支持直接在页面或组件内放置静态资源
  // 需要统一放到根目录的某个文件夹下，该逻辑后续需要改进
  if (/^(\.?\.?\/[^]+)+$/.test(path)) {
    return path.replace(/^(\.?\.?\/)+/, './')
  }

  return path
}

export const isObject = (param) => {
  return Object.prototype.toString.call(param) === '[object Object]'
}

export const getValueByOrder = (obj, props) => {
  if (!isObject(obj)) return
  const { length } = props
  let result

  for (let i = 0; i < length; i++) {
    const prop = props[i]
    if (obj[prop]) {
      result = obj[prop]
      break
    }
  }

  return result
}
