Page({
  data: {
    textArry: [],
    imgUrl:
      'https://gw.alipayobjects.com/zos/rmsportal/HRJifiDxDoDRnmrIzFQn.jpg'
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
      ocrType: 'ocr_bank_card',
      path: url,
      success: (res) => {
        let data = JSON.parse(res.result.outputs[0].outputValue.dataValue)
        let { card_num } = data
        this.setData({
          imgUrl: url,
          textArry: [{ title: '卡号', message: card_num }]
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
