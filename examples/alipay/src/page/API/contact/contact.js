Page({
  data: {
    photoFilePath: '/sdcard/DCIM/Camera/a.jpg',
    nickName: '七月流火',
    lastName: 'Last',
    middleName: 'Middle',
    firstName: 'First',
    remark: '这里是备注',
    mobilePhoneNumber: '13800000000',
    homePhoneNumber: '11111115',
    workPhoneNumber: '11111112',
    homeFaxNumber: '11111114',
    workFaxNumber: '11111111',
    hostNumber: '11111113',
    weChatNumber: 'liuhuo',
    alipayAccount: 'alipay@alipay.com',
    addressCountry: 'US',
    addressState: 'California',
    addressCity: 'San Francisco',
    addressStreet: 'Mountain View',
    addressPostalCode: '94016',
    workAddressCountry: 'China',
    workAddressState: 'Zhejiang',
    workAddressCity: 'Hangzhou',
    workAddressStreet: 'Tianmushan Road',
    workAddressPostalCode: '361005',
    homeAddressCountry: 'Canada',
    homeAddressState: 'Ontairo',
    homeAddressCity: 'Toronto',
    homeAddressStreet: 'No.234 Road',
    homeAddressPostalCode: '123456',
    organization: 'AntFin',
    title: 'Developer',
    email: 'liuhuo01@sina.com',
    url: 'www.alipay.com',
    success: (res) => {
      my.alert({
        content: 'addPhoneContact response: ' + JSON.stringify(res)
      })
    },
    fail: (res) => {
      my.alert({
        content: 'addPhoneContact response: ' + JSON.stringify(res)
      })
    }
  },
  choosePhoneContact() {
    my.choosePhoneContact({
      success: (res) => {
        my.alert({
          content: 'choosePhoneContact response: ' + JSON.stringify(res)
        })
      },
      fail: (res) => {
        my.alert({
          content: 'choosePhoneContact response: ' + JSON.stringify(res)
        })
      }
    })
  },
  chooseAlipayContact() {
    my.chooseAlipayContact({
      count: 2,
      success: (res) => {
        my.alert({
          content: 'chooseAlipayContact response: ' + JSON.stringify(res)
        })
      },
      fail: (res) => {
        my.alert({
          content: 'chooseAlipayContact response: ' + JSON.stringify(res)
        })
      }
    })
  },
  chooseContact() {
    my.chooseContact({
      chooseType: 'multi', // 多选模式
      includeMe: true, // 包含自己
      includeMobileContactMode: 'known', //仅包含双向手机通讯录联系人，也即双方手机通讯录都存有对方号码的联系人
      multiChooseMax: 3, // 最多能选择三个联系人
      multiChooseMaxTips: '超过选择的最大人数了',
      success: (res) => {
        my.alert({
          content: 'chooseContact : ' + JSON.stringify(res)
        })
      },
      fail: (res) => {
        my.alert({
          content: 'chooseContact : ' + JSON.stringify(res)
        })
      }
    })
  },
  onInput(e) {
    this.data[e.currentTarget.id] = e.detail.value
  },
  addPhoneContact() {
    if (my.canIUse('addPhoneContact')) {
      my.addPhoneContact(this.data)
    } else {
      my.alert({
        title: '客户端版本过低',
        content: 'my.addPhoneContact() 需要 10.1.32 及以上版本'
      })
    }
  }
})
