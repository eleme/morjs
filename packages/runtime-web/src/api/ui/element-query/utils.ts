export const RECT_PROPERTIES = [
  'top',
  'right',
  'bottom',
  'left',
  'width',
  'height',
  'x',
  'y'
]
export const SCROLL_OFFSET_PROPERTIES = [
  'id',
  'scrollLeft',
  'scrollTop',
  'scrollHeight',
  'scrollWidth'
]

export const getProperties = (element, properties = []) => {
  if (!element) return {}

  return properties.reduce((pre, curr) => {
    pre[curr] = element[curr]
    return pre
  }, {})
}

export const mapTarget = (target, callback) => {
  if (!target) {
    return null
  }

  if (target instanceof HTMLElement) {
    return callback(target)
  } else {
    const results = []
    target.forEach((el) => {
      results.push(callback(el))
    })
    return results
  }
}

const getDataSet = (el: HTMLElement) => {
  const result = { dataset: {} }
  try {
    const { dataset } = el
    if (!dataset) return result

    result.dataset = Object.keys(dataset).reduce((pre, key) => {
      pre[key] = dataset[key]
      return pre
    }, {})

    return result
  } catch (e) {
    return result
  }
}

export const FIELD_CONFIG_METHODS_MAP = {
  id: (el: HTMLElement) => ({ id: el.id }),
  rect: (el: HTMLElement) =>
    getProperties(el.getBoundingClientRect(), RECT_PROPERTIES),
  size: (el: HTMLElement) =>
    getProperties(el.getBoundingClientRect(), ['width', 'height']),
  scrollOffset: (el: HTMLElement) => ({
    ...getDataSet(el),
    ...getProperties(el, SCROLL_OFFSET_PROPERTIES)
  }),
  node: (el: HTMLElement) => ({ node: el }),
  computedStyle: (el: HTMLElement, keys: Array<string>) => {
    try {
      const result = {}
      if (keys.length < 0) return result
      const currentStyle = window.getComputedStyle(el)

      keys.forEach((key) => (result[key] = currentStyle.getPropertyValue(key)))

      return result
    } catch (e) {
      return {}
    }
  },
  dataset: getDataSet
}
