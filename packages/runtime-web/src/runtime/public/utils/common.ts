export const combineValue = (array, key = 'data') => {
  let result = {}

  if (!Array.isArray(array) || !key) return result

  array.forEach((item) => {
    const value = item[key]
    if (typeof value === 'object') result = { ...result, ...value }
  })

  return result
}
const isObjectAndHasCommonKeys = (obj1, obj2) => {
  const isObject = (ob: any) => typeof ob === 'object' && ob != null

  if (!(isObject(obj1) && isObject(obj2))) return false
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  if (keys1.length !== keys2.length) return false

  return keys1.every((key) => keys2.indexOf(key) > -1)
}

export const mergeExecution = (array, key = 'callback') => {
  return () => {
    if (!Array.isArray(array)) return
    // 保存一个base64化的function string数组，用于去重
    const funcBtoas = []

    array.forEach((item) => {
      const func = item[key]
      const data = item.data
      if (typeof func === 'function') {
        /*
          业务中多次在 callback 中 再次 setData，如果不移除重复的callback，会导致callback中有
          my.createAnimation 值的时候，后续的设置为空（export 之后，animation后续不再有值）
        */
        const btoa = window.btoa(encodeURIComponent(func.toString()))
        const index = funcBtoas.indexOf(btoa)
        if (index < 0) {
          // setData callback 中，确保每次只执行一次即可
          func()
          funcBtoas.push(btoa)
        } else {
          /*
            基于上述原因,我们做了 callback 去重，但是如果业务侧自己做了批量更新功能（比如交易链路，estore）
            会导致 callback 一直是重复的，后续的callback都会被移除，所以判断下每次setData 的key是否相同，
            只有每次 setData 的key 相同，我们才移除callback
          */
          const hadObj = array[index].data
          if (!isObjectAndHasCommonKeys(data, hadObj)) func()
        }
      }
    })
  }
}
