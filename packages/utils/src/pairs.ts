export const Pairs = {
  /**
   * 构建键值对字符串
   * @param {Object} param - 包含键值对的对象
   * @returns {string} - 键值对组合成的字符串，键和值之间以下划线连接，各对之间以破折号分隔
   */
  toString(param: Record<string, any>): string {
    const keys = Object.keys(param)

    return keys.reduce((pre, key, index) => {
      const value = param[key]
      const suffix = index === keys.length - 1 ? '' : '-'

      return (pre += `${key}_${value}${suffix}`)
    }, '')
  },

  /**
   * 根据键值对字符串创建对象
   * @param {string} param - 以短横线分隔的键值对字符串，形如 "key1_value1-key2_value2"
   * @returns {Object} - 创建的对象，键为原始字符串中的 key，值为对应的 value
   */
  toObject(param: string): Record<string, any> {
    const result = {}
    if (typeof param !== 'string') return result

    const paramsArr = param.split('-')
    paramsArr.forEach((pair) => {
      const [key, value] = pair.split('_')
      result[key] = value
    })

    return result
  }
}
