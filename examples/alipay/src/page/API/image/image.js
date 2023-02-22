Page({
  chooseImage() {
    my.chooseImage({
      sourceType: ['camera', 'album'],
      count: 2,
      success: (res) => {
        my.alert({
          content: JSON.stringify(res)
        })
      },
      fail: () => {
        my.showToast({
          content: 'fail' // 文字内容
        })
      }
    })
  },
  previewImage() {
    my.previewImage({
      current: 2,
      urls: [
        'https://img.alicdn.com/tps/TB1sXGYIFXXXXc5XpXXXXXXXXXX.jpg',
        'https://img.alicdn.com/tps/TB1pfG4IFXXXXc6XXXXXXXXXXXX.jpg',
        'https://img.alicdn.com/tps/TB1h9xxIFXXXXbKXXXXXXXXXXXX.jpg'
      ]
    })
  },
  saveImage() {
    my.saveImage({
      url: 'https://img.alicdn.com/tps/TB1sXGYIFXXXXc5XpXXXXXXXXXX.jpg',
      showActionSheet: true,
      success: () => {
        my.alert({
          title: '保存成功'
        })
      }
    })
  }
})
