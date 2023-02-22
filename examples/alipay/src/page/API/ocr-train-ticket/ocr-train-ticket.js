Page({
  data: {
    textArry: [],
    imgUrl:
      'https://gw.alipayobjects.com/zos/rmsportal/bQcotnJacNoSYPeNfAjZ.jpg'
  },
  onLoad() {
    this.callFn(this.data.imgUrl)
  },
  callFn(url) {
    my.showLoading({
      content: '加载中...',
      delay: 100
    })
    my.ocr({
      ocrType: 'ocr_train_ticket',
      path: url,
      success: (res) => {
        let data = res.result
        let { date, destination, origin, level, number, place, price } = data
        this.setData({
          imgUrl: url,
          textArry: [
            { title: '乘坐时间', message: date },
            { title: '目的地', message: destination },
            { title: '出发地', message: origin },
            { title: '车型', message: level },
            { title: '车次', message: number },
            { title: '座位', message: place },
            { title: '票价', message: price }
          ]
        })
        my.hideLoading()
      },
      fail: (res) => {
        my.hideLoading()

        my.alert({
          title: 'fail',
          content: JSON.stringify(res)
        })
      }
    })
  },
  photoSubmit() {
    //点击上传
    my.chooseImage({
      count: 1,
      success: (res) => {
        this.callFn(res.apFilePaths[0])
      }
    })
  },
  imageLoad(e) {},
  imageError(e) {}
})
