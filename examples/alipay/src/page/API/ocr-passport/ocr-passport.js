Page({
  data: {
    textArry: [
      { title: '签发机关', message: '公安部出入境管理局' },
      { title: '生日', message: '2020年12月27日' },
      { title: '出生地', message: '四川' },
      { title: '国籍', message: 'CHN' },
      { title: '到期日期', message: '2044年04月08日' },
      { title: '发证日期', message: '2024年04月09日' },
      { title: '发证地址', message: '四川' },
      { title: '姓名英文', message: 'ZHIXIAOBAO' },
      { title: '姓名中文', message: '支小宝' },
      { title: '护照号码', message: 'E09222222' },
      { title: '身份ID', message: 'MCNONCNF<<<<A9' },
      { title: '性别', message: 'F' },
      { title: '国家', message: 'CHN' }
    ],
    imgUrl:
      'https://gw.alipayobjects.com/zos/rmsportal/JUcFsOCCRzlYpEHkKczj.jpg'
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
      ocrType: 'ocr_passport',
      path: url,
      success: (res) => {
        let data = JSON.parse(res.result.outputs[0].outputValue.dataValue)

        let {
          authority,
          birth_date,
          birth_place,
          country,
          expiry_date,
          issue_date,
          issue_place,
          name,
          name_cn,
          passport_no,
          person_id,
          sex,
          src_country
        } = data
        this.setData({
          imgUrl: url,
          textArry: [
            { title: '签发机关', message: authority },
            { title: '生日', message: this.reData(birth_date) },
            { title: '出生地', message: birth_place },
            { title: '国籍', message: country },
            { title: '到期日期', message: this.reData(expiry_date) },
            { title: '发证日期', message: this.reData(issue_date) },
            { title: '发证地址', message: issue_place },
            { title: '姓名英文', message: name },
            { title: '姓名中文', message: name_cn },
            { title: '护照号码', message: passport_no },
            { title: '身份ID', message: person_id },
            { title: '性别', message: sex },
            { title: '国家', message: src_country }
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
