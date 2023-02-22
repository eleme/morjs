export function getEvent(funName, data, isCatch = false) {
  if (!funName) return
  const { $reactComp } = data
  const event = $reactComp.getCompMethod(funName)
  // 阻止冒泡事件的处理逻辑
  if (isCatch) {
    return function (e) {
      // 阻止冒泡事件
      if (e.stopPropagation) e.stopPropagation()
      event(e)
    }
  }
  return event
}

export function bindThis(thistarget, func) {
  const f = function () {
    // eslint-disable-next-line prefer-rest-params
    return func.apply(thistarget, arguments)
  }
  if (func.name) {
    // 因为不允许直接修改name，因此这里只能绕路用 __name__ 重新设置 name
    f.__name__ = func.name
  }
  return f
}

export function registEvents(events, $data, nodeId) {
  const { $reactComp } = $data
  $reactComp.registEvents(events, nodeId)
}
