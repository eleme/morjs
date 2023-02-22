Page({
  data: {
    textArry: [
      { title: '车牌号码', message: '浙BC9188' },
      { title: '车辆类型', message: '小型轿车' },
      { title: '所有人', message: '支小宝' },
      { title: '地址', message: '浙江省宁波市江东区园丁街88弄' },
      { title: '使用性质', message: '出租转非' },
      { title: '品牌型号', message: '桑塔纳牌SVW7180LE1' },
      { title: '识别代码', message: 'LSVAU033661234567' },
      { title: '发动机号', message: '0009827' },
      { title: '注册日期', message: '2006年07月21日' },
      { title: '发证日期', message: '2013年07月08日' }
    ],
    imgUrl:
      'https://gw.alipayobjects.com/zos/rmsportal/xyWhFGfKPgIlwMtztXnf.jpg'
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
      ocrType: 'ocr_vehicle',
      path: url,
      success: (res) => {
        console.log('res', res)
        let data = JSON.parse(res.result.outputs[0].outputValue.dataValue)
        let {
          plate_num,
          addr,
          vehicle_type,
          owner,
          use_character,
          model,
          vin,
          engine_num,
          register_date,
          issue_date
        } = data
        this.setData({
          imgUrl: url,
          textArry: [
            { title: '车牌号码', message: plate_num },
            { title: '车辆类型', message: vehicle_type },
            { title: '所有人', message: owner },
            { title: '地址', message: addr },
            { title: '使用性质', message: use_character },
            { title: '品牌型号', message: model },
            { title: '识别代码', message: vin },
            { title: '发动机号', message: engine_num },
            { title: '注册日期', message: this.reData(register_date) },
            { title: '发证日期', message: this.reData(issue_date) }
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
  reData(data) {
    return (
      data.substring(0, 4) +
      '年' +
      data.substring(4, 6) +
      '月' +
      data.substring(6, 8) +
      '日'
    )
  },
  imageLoad(e) {},
  imageError(e) {}
})
