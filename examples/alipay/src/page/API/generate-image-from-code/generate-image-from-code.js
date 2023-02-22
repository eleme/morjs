Page({
  data: {
    imageStr: '',
    mode: 'aspectFit'
  },
  buttonClick() {
    my.generateImageFromCode({
      code: 'https://www.alipay.com',
      format: 'QRCODE',
      width: 200,
      correctLevel: 'H',
      success: (data) => {
        console.log(data)
        this.setData({
          imageStr: data.image
        })
      }
    })
  }
})
