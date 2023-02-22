Page({
  data: {
    textArry: [],
    imgUrl:
      'https://gw.alipayobjects.com/zos/rmsportal/ELiPtNKfHIGlpjOotpoC.jpg'
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
      ocrType: 'ocr_business_card',
      path: url,
      success: (res) => {
        let data = JSON.parse(res.result.outputs[0].outputValue.dataValue)
        let {
          name,
          company,
          department,
          title,
          tel_cell,
          tel_work,
          addr,
          email
        } = data
        this.setData({
          imgUrl: url,
          textArry: [
            { title: '姓名', message: name },
            { title: '公司', message: company },
            { title: '部门', message: department },
            { title: '职位', message: title },
            { title: '手机号码', message: tel_cell },
            { title: '电话号码', message: tel_work },
            { title: '地址', message: addr },
            { title: '邮箱', message: email }
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
