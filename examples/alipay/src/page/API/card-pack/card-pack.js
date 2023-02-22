Page({
  data: {},
  onLoad() {},

  //-----------卡/券/票 列表页JSAPI:   只有success  fail等回调入参
  openCardList() {
    my.openCardList({
      success: (res) => {
        my.showToast({ content: '调用成功：' + JSON.stringify(res) })
      },
      fail: (error) => {
        my.alert({ content: '调用失败：' + JSON.stringify(error) })
      },
      complete: (res) => {
        my.alert({ content: 'complete回调！' })
      }
    })
  },

  openVoucherList() {
    my.openVoucherList({
      success: (res) => {
        my.showToast({ content: '调用成功：' + JSON.stringify(res) })
      },
      fail: (error) => {
        my.alert({ content: '调用失败：' + JSON.stringify(error) })
      },
      complete: (e) => {
        my.showToast({ content: 'complete回调！' })
      }
    })
  },

  openTicketList() {
    my.openTicketList({
      success: (res) => {
        my.showToast({ content: '调用成功：' + JSON.stringify(res) })
      },
      fail: (error) => {
        my.alert({ content: '调用失败：' + JSON.stringify(error) })
      },
      complete: (e) => {
        my.showToast({ content: 'complete回调！' })
      }
    })
  },

  //---------卡/券/票 详情页JSAPI:   passId 或者 partnerId + serialNumber  二选一的入参
  openCardDetail() {
    my.openCardDetail({
      //卡   不支持partnerId方式
      passId: '12339004637',
      success: (res) => {
        my.showToast({ content: '调用成功：' + JSON.stringify(res) })
      },
      fail: (error) => {
        my.alert({ content: '调用失败：' + JSON.stringify(error) })
      },
      complete: (res) => {
        my.showToast({ content: 'complete回调！' })
      }
    })
  },
  openVoucherDetail() {
    my.openVoucherDetail({
      passId: '15153594937', //
      //partnerId:'2088521411242352',
      // serialNumber:'20170904000730023708007XVP2W',
      //开发环境
      //passId:"7001350165",
      // partnerId:'2088302084359231',
      // serialNumber:'2017060218522661677653862',
      success: (res) => {
        my.showToast({ content: '调用成功：' + JSON.stringify(res) })
      },
      fail: (error) => {
        my.alert({ content: '调用失败：' + JSON.stringify(error) })
      },
      complete: (e) => {
        my.showToast({ content: 'complete回调！' })
      }
    })
  },

  openTicketDetail() {
    my.openTicketDetail({
      passId: '11688279837',
      //partnerId:'2013080800000754',
      //serialNumber:'T150P4607471458101261',
      //passId:"7001020065",
      //partnerId:'2088101162864452',
      //serialNumber:'2017033120573899567387727',
      success: (res) => {
        my.showToast({ content: '调用成功：' + JSON.stringify(res) })
      },
      fail: (error) => {
        my.alert({ content: '调用失败：' + JSON.stringify(error) })
      },
      complete: (e) => {
        my.showToast({ content: 'complete回调！' })
      }
    })
  },

  //打开口碑券详情
  openKBVoucherDetail() {
    my.openKBVoucherDetail({
      passId: '13813142037',
      //partnerId:'2088912612862076',
      //serialNumber:'201708010007300237080079G88A',

      // passId:'7001430265',
      // partnerId:'2088102147297014',
      // serialNumber:'201708250007300265750000AWST',
      success: (res) => {
        my.showToast({ content: '调用成功：' + JSON.stringify(res) })
      },
      fail: (error) => {
        my.alert({ content: '调用失败：' + JSON.stringify(error) })
      },
      complete: (e) => {
        my.showToast({ content: 'complete回调！' })
      }
    })
  },
  //口碑客劵详情页
  gotoDetail() {
    my.navigateToCouponDetail({
      itemId: '2017072010076000000015900884',
      chInfo: 'ch_cainiao__spmid_a13.b579',
      success: (res) => {
        my.alert({
          title: 'success',
          content: JSON.stringify(res)
        })
      },
      fail: (res) => {
        my.alert({
          title: 'fail',
          content: JSON.stringify(res)
        })
      },
      complete: (res) => {
        my.showToast({ content: 'complete回调！' })
      }
    })
  },

  //--------------------卡/券/票 单商户列表页:    partnerId  入参
  openMerchantCardList() {
    my.openMerchantCardList({
      partnerId: '2088621202286735',
      success: (res) => {
        my.showToast({ content: '调用成功：' + JSON.stringify(res) })
      },
      fail: (error) => {
        my.alert({ content: '调用失败：' + JSON.stringify(error) })
      },
      complete: (e) => {
        my.showToast({ content: 'complete回调！' })
      }
    })
  },

  openMerchantVoucherList() {
    my.openMerchantVoucherList({
      partnerId: '2088521411242352',
      success: (res) => {
        my.showToast({ content: '调用成功：' + JSON.stringify(res) })
      },
      fail: (error) => {
        my.alert({ content: '调用失败：' + JSON.stringify(error) })
      },
      complete: (e) => {
        my.showToast({ content: 'complete回调！' })
      }
    })
  },

  openMerchantTicketList() {
    my.openMerchantTicketList({
      partnerId: '2013080800000754',
      success: (res) => {
        my.showToast({ content: '调用成功：' + JSON.stringify(res) })
      },
      fail: (error) => {
        my.alert({ content: '调用失败：' + JSON.stringify(error) })
      },
      complete: (e) => {
        my.showToast({ content: 'complete回调！' })
      }
    })
  }
})
