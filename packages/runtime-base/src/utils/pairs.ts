export const Pairs = {
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
