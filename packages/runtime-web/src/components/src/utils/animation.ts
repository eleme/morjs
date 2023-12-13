import { addUnit } from './unit'
export const KEY_ANIMATION = 'animation'

const propertyRegex = (key) => new RegExp(key + '\\(([^)]+)\\)', 'i')
const boxRegex = (key) => new RegExp(key + ':([^;]+);', 'i')
const dasherize = (param) => {
  if (typeof param !== 'string') return param

  return param.replace(
    /(?!^)([A-Z])/g,
    (all, match) => '-' + match.toLowerCase()
  )
}

const formateParam = (param) =>
  typeof param === 'string' ? JSON.parse(param) : param
const appearanceProperty = ['opacity', 'backgroundColor']
const boxPropertys = [
  ...appearanceProperty,
  'width',
  'height',
  'top',
  'left',
  'right',
  'bottom'
]

// const initTransform = () => {
//   return 'rotate3d(0, 0, 0, 0deg) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scaleX(1) scaleY(1) translateX(0px) translateY(0px) skewX(0deg) skewY(0deg)'
// }

const timePromise = (time) =>
  new Promise((resolve) => {
    setTimeout(resolve, time)
  })

function getTransform(style: string): string {
  try {
    if (!style || style.indexOf('transform') < 0) return ''
    return /transform:\s?([^;]+)/gim.exec(style)?.[1] || ''
  } catch (e) {
    console.error(`${e}`)
    return ''
  }
}

const getTransformValue = (raw, key) => {
  try {
    if (!raw) return
    const matchResult = propertyRegex(key).exec(raw)
    return matchResult ? matchResult[1] : ''
  } catch (e) {
    console.warn(`${e}`)
  }
}

const formateTransformValue = (key, value) => {
  const isTranslate = key.indexOf('translate') > -1
  const isSkew = key.indexOf('skew') > -1
  const isRotate = key.indexOf('rotate') > -1

  if (isRotate) {
    const lastValue = value.pop()
    value.push(lastValue + 'deg')
    return value
  } else if (isTranslate || isSkew) {
    const unit = isSkew ? 'deg' : 'px'
    value = value.map((item) => addUnit(item, unit))
    return value
  }

  return value
}

const getTransformStyle = (raw = '', key, value) => {
  // 如果原来没有该属性，则直接设置即可
  const resultValue = formateTransformValue(key, value)
  const property = `${key}(${resultValue.join(',')})`

  if (!getTransformValue(raw, key)) {
    raw += ` ${property}`
    return raw
  }

  const regex = propertyRegex(key)
  raw = raw.replace(regex, property)
  return raw
}

const generateConfig = (config) => {
  const { delay, duration, timeFunction, transformOrigin } = config
  const transformConfig = {
    'transform-origin': transformOrigin,
    'transition-delay': `${delay}ms`,
    'transition-duration': `${duration}ms`,
    'transition-timing-function': timeFunction,
    'transition-property': 'all'
  }

  return transformConfig
}

const getBoxStyle = (key, value) => {
  const formateValue = () =>
    appearanceProperty.indexOf(key) > -1 ? value : value + 'px'

  return {
    [dasherize(key)]: formateValue()
  }
}

const replaceStyle = (style = '', obj, isRemove = false) => {
  const keys = Object.keys(obj)

  keys.forEach((item) => {
    const hasValue = style.indexOf(item + ':') > -1
    const value = isRemove ? '' : obj[item] ? `${item}: ${obj[item]};` : ''

    if (!hasValue && !isRemove) {
      style += ` ${value}`
      return
    }

    style = style.replace(boxRegex(item), value)
  })

  return style
}

const getStyle = (frame, style) => {
  try {
    const { config, animation } = frame
    if (animation.length < 1) return

    const transformConfig = generateConfig(config)
    // let exsitTransform = getTransform(style) || initTransform()
    let exsitTransform = getTransform(style)
    let boxStyle = {}

    animation.forEach((item) => {
      const [key, value] = item

      if (boxPropertys.indexOf(key) > -1) {
        boxStyle = { ...boxStyle, ...getBoxStyle(key, value) }
      } else {
        exsitTransform = getTransformStyle(exsitTransform, key, value)
      }
    })

    style = replaceStyle(style, transformConfig)
    style = replaceStyle(style, boxStyle)
    style = replaceStyle(style, { transform: exsitTransform })

    return style
  } catch (e) {
    console.error(`${e}`)
    return
  }
}

export function* parseAnimation2Style(param, context) {
  param = formateParam(param)
  param = param == null ? [] : param

  for (let i = 0; i < param.length; i++) {
    const frame = param[i]
    const duration = i > 0 ? param[i - 1].config.duration : 0
    yield timePromise(duration).then(() => {
      const style = context.getAttribute('style') || ''
      return getStyle(frame, style)
    })
  }
}

export const autoRun = (fn, callback) => {
  const gen = fn()

  function next() {
    const result = gen.next()
    if (result.done) return

    result.value.then((value) => {
      callback(value)
      next()
    })
  }

  next()
}
