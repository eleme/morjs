Page({
  bindHideKeyboard(e) {
    if (e.detail.value === '123') {
      // 收起键盘
      my.hideKeyboard()
    }
  }
})
