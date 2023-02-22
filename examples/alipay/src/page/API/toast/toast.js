Page({
  showToastSuccess() {
    my.showToast({
      type: 'success',
      content: '操作成功',
      duration: 3000,
      success: () => {
        my.alert({
          title: 'toast 消失了'
        })
      }
    })
  },
  showToastFail() {
    my.showToast({
      type: 'fail',
      content: '操作失败',
      duration: 3000,
      success: () => {
        my.alert({
          title: 'toast 消失了'
        })
      }
    })
  },
  showToastException() {
    my.showToast({
      type: 'exception',
      content: '网络异常',
      duration: 3000,
      success: () => {
        my.alert({
          title: 'toast 消失了'
        })
      }
    })
  },
  showToastNone() {
    my.showToast({
      type: 'none',
      content: '提醒',
      duration: 3000,
      success: () => {
        my.alert({
          title: 'toast 消失了'
        })
      }
    })
  },
  hideToast() {
    my.hideToast()
  }
})
