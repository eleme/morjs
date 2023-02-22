Page({
  data: {
    switch1: true
  },
  switch1Change(e) {
    console.log('switch1 发生 change 事件，携带值为', e.detail.value)
    this.setData({
      switch1: e.detail.value
    })
  },
  switch2Change(e) {
    console.log('switch2 发生 change 事件，携带值为', e.detail.value)
  }
})
