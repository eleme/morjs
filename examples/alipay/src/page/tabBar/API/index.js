let openAPIList = [
  {
    name: '获取授权码',
    path: '/page/API/get-auth-code/get-auth-code'
  }
]

if (my.ap) {
  openAPIList = openAPIList.concat([
    {
      name: '获取用户信息',
      path: '/page/API/get-user-info/get-user-info'
    },
    {
      name: '发起支付',
      path: '/page/API/request-payment/request-payment'
    },
    {
      name: '支付宝卡包',
      path: '/page/API/card-pack/card-pack'
    },
    {
      name: '芝麻信用借还',
      path: '/page/API/zm-credit-borrow/zm-credit-borrow'
    }
  ])

  if (my.canIUse('isCollected')) {
    openAPIList = openAPIList.concat([
      {
        name: '收藏',
        path: '/page/API/favorite/favorite'
      }
    ])
  }

  if (my.canIUse('textRiskIdentification')) {
    openAPIList = openAPIList.concat([
      {
        name: '文本风险识别',
        path: '/page/API/text-risk-identification/text-risk-identification'
      }
    ])
  }
  if (my.canIUse('generateImageFromCode')) {
    openAPIList = openAPIList.concat([
      {
        name: '生成二维码',
        path: '/page/API/generate-image-from-code/generate-image-from-code'
      }
    ])
  }
}

let interfaceList = [
  {
    name: '警告框',
    path: '/page/API/alert/alert'
  },
  {
    name: '确认框',
    path: '/page/API/confirm/confirm'
  },
  {
    name: '弱提示',
    path: '/page/API/toast/toast'
  },
  {
    name: '加载提示',
    path: '/page/API/loading/loading'
  },
  {
    name: '操作菜单',
    path: '/page/API/action-sheet/action-sheet'
  },
  {
    name: '设置界面导航栏',
    path: '/page/API/set-navigation-bar/set-navigation-bar'
  },
  {
    name: '设置optionMenu',
    path: '/page/API/option-menu/option-menu'
  },
  {
    name: '页面跳转',
    path: '/page/API/navigator/navigator'
  },
  {
    name: '下拉刷新',
    path: '/page/API/pull-down-refresh/pull-down-refresh'
  },
  {
    name: '创建动画',
    path: '/page/API/animation/animation'
  },
  {
    name: '创建绘画',
    path: '/page/API/canvas/canvas'
  },
  {
    name: '选择日期',
    path: '/page/API/date-picker/date-picker'
  },
  {
    name: '滚动页面',
    path: '/page/API/page-scroll-to/page-scroll-to'
  },
  {
    name: '节点查询',
    path: '/page/API/create-selector-query/create-selector-query'
  }
]

if (my.ap) {
  interfaceList = interfaceList.concat([
    {
      name: '联系人',
      path: '/page/API/contact/contact'
    },
    {
      name: '标题栏加载动画',
      path: '/page/API/navigation-bar-loading/navigation-bar-loading'
    },
    {
      name: '选择城市',
      path: '/page/API/choose-city/choose-city'
    },
    {
      name: '隐藏键盘',
      path: '/page/API/keyboard/keyboard'
    }
  ])

  if (my.canIUse('multiLevelSelect')) {
    interfaceList = interfaceList.concat([
      {
        name: '级联选择',
        path: '/page/API/multi-level-select/multi-level-select'
      }
    ])
  }

  if (my.canIUse('optionsSelect')) {
    interfaceList = interfaceList.concat([
      {
        name: '选项选择器',
        path: '/page/API/options-select/options-select'
      }
    ])
  }

  if (my.canIUse('getTitleColor')) {
    interfaceList = interfaceList.concat([
      {
        name: '获取导航栏背景颜色',
        path: '/page/API/get-title-color/get-title-color'
      }
    ])
  }
}

let deviceAPIList = [
  {
    name: '获取手机网络状态',
    path: '/page/API/get-network-type/get-network-type'
  },
  {
    name: '获取手机系统信息',
    path: '/page/API/get-system-info/get-system-info'
  },
  {
    name: '振动',
    path: '/page/API/vibrate/vibrate'
  },
  {
    name: '剪贴板',
    path: '/page/API/clipboard/clipboard'
  }
]

if (my.ap) {
  deviceAPIList = deviceAPIList.concat([
    {
      name: '获取基础版本库',
      path: '/page/API/sdk-version/sdk-version'
    },
    {
      name: '屏幕亮度',
      path: '/page/API/screen/screen'
    },
    {
      name: '摇一摇',
      path: '/page/API/watch-shake/watch-shake'
    },
    {
      name: '拨打电话',
      path: '/page/API/make-phone-call/make-phone-call'
    },
    {
      name: '用户截屏事件',
      path: '/page/API/user-capture-screen/user-capture-screen'
    },
    {
      name: '获取服务器时间',
      path: '/page/API/get-server-time/get-server-time'
    },
    {
      name: '内存不足告警',
      path: '/page/API/memory-warning/memory-warning'
    }
  ])
}

const networkAPIList = [
  {
    name: '发起HTTP请求',
    path: '/page/API/request/request'
  },
  {
    name: '上传文件',
    path: '/page/API/upload-file/upload-file'
  },
  {
    name: '下载文件',
    path: '/page/API/download-file/download-file'
  },
  {
    name: 'Websocket',
    path: '/page/API/websocket/websocket'
  }
]

const mediaAPIList = [
  {
    name: '图片',
    path: '/page/API/image/image'
  },
  {
    name: '获取图片信息',
    path: '/page/API/get-image-info/get-image-info'
  },
  {
    name: '压缩图片',
    path: '/page/API/compress-image/compress-image'
  }
]

const locationAPIList = [
  {
    name: '获取当前位置',
    path: '/page/API/get-location/get-location'
  },
  {
    name: '使用原生地图查看位置',
    path: '/page/API/open-location/open-location'
  },
  {
    name: '打开地图选择位置',
    path: '/page/API/choose-location/choose-location'
  }
]

let otherAPIList = [
  {
    name: '缓存',
    path: '/page/API/storage/storage'
  },
  {
    name: '扫码 Scan',
    path: '/page/API/scan-code/scan-code'
  },
  {
    name: '自定义分享',
    path: '/page/API/share/share'
  }
]

if (my.ap) {
  otherAPIList = otherAPIList.concat([
    {
      name: '文件',
      path: '/page/API/file/file'
    },
    {
      name: '蓝牙',
      path: '/page/API/bluetooth/bluetooth'
    },
    {
      name: '数据安全',
      path: '/page/API/rsa/rsa'
    },
    {
      name: '自定义分析',
      path: '/page/API/report-analytics/report-analytics'
    }
  ])

  if (my.canIUse('on')) {
    otherAPIList = otherAPIList.concat([
      {
        name: '容器事件',
        path: '/page/API/events/events'
      }
    ])
  }

  if (my.canIUse('ocr')) {
    otherAPIList = otherAPIList.concat([
      {
        name: 'OCR',
        path: '/page/API/ocr/ocr'
      }
    ])
  }
}

const APIList = [
  {
    type: '开放接口',
    list: openAPIList
  },
  {
    type: '界面',
    list: interfaceList
  },
  {
    type: '设备',
    list: deviceAPIList
  },
  {
    type: '网络',
    list: networkAPIList
  },
  {
    type: '多媒体',
    list: mediaAPIList
  },
  {
    type: '位置',
    list: locationAPIList
  },
  {
    type: '其他',
    list: otherAPIList
  }
]

Page({
  data: {
    APIList
  },
  onSearchBarTap() {
    my.navigateTo({
      url: '/page/common/search/search'
    })
  },
  openPage(e) {
    my.navigateTo({
      url: e.target.dataset.url
    })
  }
})
