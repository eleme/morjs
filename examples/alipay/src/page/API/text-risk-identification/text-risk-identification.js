Page({
  data: {
    value: ''
  },
  handleInput(event) {
    this.setData({
      value: event.detail.value
    })
  },
  textRiskIdentification() {
    my.textRiskIdentification({
      content: this.data.value,
      type: ['keyword', '0', '1', '2', '3'],
      success: (res) => {
        my.alert({
          title: this.data.value,
          content: JSON.stringify(res)
        })
      }
    })
  }
})
