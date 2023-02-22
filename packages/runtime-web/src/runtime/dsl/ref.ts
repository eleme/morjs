export default function ref(value, data) {
  if (typeof value !== 'string') {
    throw new Error('ref 必须是以字符串形式的引用')
  } else {
    const { $reactComp } = data
    return function (ref) {
      if (ref && !ref.__hasRef__) {
        // 确保ref只会被执行一次，避免出现死循环。比如：在ref的回调方法里面调用setData方法就会出现死循环
        if ($reactComp.onRef(ref, value)) {
          ref.__hasRef__ = true
        }
      }
    }
  }
}
