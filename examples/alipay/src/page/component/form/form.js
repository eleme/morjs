Page({
  data: {},
  onSubmit(e) {
    my.alert({
      content: `数据：${JSON.stringify(e.detail.value)}`
    })
  },
  onReset() {}
})
