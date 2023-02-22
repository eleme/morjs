export function toJsonString(value: any, isDataSet = false) {
  if (isDataSet) {
    switch (typeof value) {
      case 'string': {
        return value
      }
      case 'object': {
        if (value == null) {
          return '$.nul()'
        }
        return `$.value(${JSON.stringify(value)})`
      }
      case 'function': {
        return ''
        // throw new Error('dataset 数据不允许传 function');
      }
      case 'undefined': {
        return '$.undefined()'
      }
      case 'bigint':
      case 'number':
      case 'boolean': {
        return `$.value(${value})`
      }
      default: {
        return `$.value(${value})`
      }
    }
  } else {
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    return value
  }
}

const DataSetParser = {
  nul() {
    return null
  },
  undefined() {
    return undefined
  },
  value(v) {
    return v
  }
}

const DATA_SET_PARSER_REGEXP = /^\$\.(value|nul|undefined)\(/

/**
 * 解析dataset value
 * @param {*} str
 */
export function parseDatasetValue(str: any) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const $ = DataSetParser
  try {
    // 限定 eval 的使用范围
    // 仅用于 DataSetParser 中包含的方法
    // 其他情况直接返回字符串
    if (typeof str === 'string' && DATA_SET_PARSER_REGEXP.test(str)) {
      return eval(str)
    } else {
      return str
    }
  } catch (e) {
    return str
  }
}
