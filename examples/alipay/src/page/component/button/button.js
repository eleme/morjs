Page({
  data: {},
  onShareAppMessage() {
    return {
      title: 'view page',
      path: 'page/component/view/view'
    }
  },
  onSubmit() {
    my.alert({ title: 'You click submit' })
  },
  onReset() {
    my.alert({ title: 'You click reset' })
  }
})
