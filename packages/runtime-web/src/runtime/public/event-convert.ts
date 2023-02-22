import { parseDatasetValue } from '../dsl/attribute-value'

const NO_DETAIL_EVENT = ['regionchange']

export default function (e) {
  const target = e.target && convertTarget(e.target)
  try {
    // 在支付宝小程序，e.target.dataset 取的是 e.currentTarget.dataset
    const currentTargetDataset =
      (e.currentTarget && convertTarget(e.currentTarget).dataset) || {}
    target.dataset = { ...target.dataset, ...currentTargetDataset }
  } catch (e) {}

  // 回传参数不用detail包装直接返回
  if (NO_DETAIL_EVENT.includes(e.type)) {
    return {
      ...e.detail,
      nativeEvent: e,
      currentTarget:
        e.currentTarget &&
        (e.target === e.currentTarget
          ? target
          : convertTarget(e.currentTarget)),
      target,
      timeStamp: new Date().valueOf()
    }
  }

  const info = {
    nativeEvent: e,
    type: e.type,
    detail: e.detail,
    target: target,
    currentTarget:
      e.currentTarget &&
      (e.target === e.currentTarget ? target : convertTarget(e.currentTarget)),
    timeStamp: new Date().valueOf(),
    ...e.other
  }

  switch (e.type) {
    case 'scroll': {
      info.detail = scrollDetail(e)
      break
    }
  }
  return info
}

function convertTarget(el) {
  return {
    id: el.id,
    dataset: convertDataSet(el.dataset),
    tagName: el.tagName // TODO: tagName转换成标准的小程序标签名称
  }
}
function convertDataSet(dataset) {
  const ds = {}
  if (dataset) {
    //  这里的转换，主要是为了 dataset 支持对象或者数组
    Object.keys(dataset).forEach((key) => {
      const value = dataset[key]
      ds[key] = parseDatasetValue(value)
    })
  }
  return ds
}

/**
 * 滚动事件的detail
 * @param {*} e
 */
function scrollDetail(e) {
  const currentTarget = e.currentTarget
  return {
    scrollTop: currentTarget.scrollTop,
    scrollLeft: currentTarget.scrollLeft,
    scrollHeight: currentTarget.scrollHeight,
    scrollWidth: currentTarget.scrollWidth
  }
}
