Page({
  data: {
    src: 'https://img.alicdn.com/tps/TB1sXGYIFXXXXc5XpXXXXXXXXXX.jpg'
  },
  getImageInfo() {
    my.getImageInfo({
      src: this.data.src,
      success: (res) => {
        my.alert({
          content: JSON.stringify(res)
        })
      }
    })
  }
})
