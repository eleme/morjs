Page({
  data: {
    value: '',
    showVoice: false
  },
  handleInput(value) {
    this.setData({
      value
    })
  },
  handleClear() {
    this.setData({
      value: ''
    })
  },
  handleFocus() {},
  handleBlur() {},
  handleCancel() {
    this.setData({
      value: ''
    })
  },
  handleSubmit(value) {
    my.alert({
      content: value
    })
  },
  onChange(e) {
    this.setData({
      showVoice: e.detail.value
    })
  }
})
