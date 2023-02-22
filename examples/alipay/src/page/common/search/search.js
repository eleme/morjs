import debounce from '/util/debounce'

const componentList = [
  {
    name: '金额输入',
    thumb: '/image/icon/amount-input.png',
    path: '/page/component/amount-input/amount-input',
    suggestion: 'amountinput金额输入'
  },
  {
    name: '按钮',
    thumb: '/image/icon/button.png',
    path: '/page/component/button/button',
    suggestion: 'button按钮'
  },
  {
    name: '日历',
    thumb: '/image/icon/calendar.png',
    path: '/page/component/calendar/calendar',
    suggestion: 'calendar日历'
  },
  {
    name: '卡片',
    thumb: '/image/icon/card.png',
    path: '/page/component/card/card',
    suggestion: 'card卡片'
  },
  {
    name: '复选框',
    thumb: '/image/icon/checkbox.png',
    path: '/page/component/checkbox/checkbox',
    suggestion: 'checkbox复选框'
  },
  {
    name: '单选框',
    thumb: '/image/icon/radio.png',
    path: '/page/component/radio/radio',
    suggestion: 'radio单选框'
  },
  {
    name: '云客服',
    thumb: '/image/icon/contact-button.png',
    path: '/page/component/contact-button/contact-button',
    suggestion: 'contactbutton云客服'
  },
  {
    name: '画布',
    thumb: '/image/icon/canvas.png',
    path: '/page/component/canvas/canvas',
    suggestion: 'canvas画布'
  },
  {
    name: '筛选',
    thumb: '/image/icon/filter.png',
    path: '/page/component/filter/filter',
    suggestion: 'filter筛选'
  },
  {
    name: '页脚',
    thumb: '/image/icon/footer.png',
    path: '/page/component/footer/footer',
    suggestion: 'footer页脚'
  },
  {
    name: '表单',
    thumb: '/image/icon/form.png',
    path: '/page/component/form/form',
    suggestion: 'form表单'
  },
  {
    name: '宫格',
    thumb: '/image/icon/grid.png',
    path: '/page/component/grid/grid',
    suggestion: 'grid宫格'
  },
  {
    name: '图标',
    thumb: '/image/icon/icon.png',
    path: '/page/component/icon/icon',
    suggestion: 'icon图标'
  },
  {
    name: '图标',
    thumb: '/image/icon/icon.png',
    path: '/page/component/am-icon/am-icon',
    suggestion: 'icon图标'
  },
  {
    name: '图片',
    thumb: '/image/icon/image.png',
    path: '/page/component/image/image',
    suggestion: 'image图片媒体'
  },
  {
    name: '文本输入',
    thumb: '/image/icon/input.png',
    path: '/page/component/input-item/input-item',
    suggestion: 'inputitem文本输入'
  },
  {
    name: '标签',
    thumb: '/image/icon/label.png',
    path: '/page/component/label/label',
    suggestion: 'label标签'
  },
  {
    name: '跳转生活号',
    thumb: '/image/icon/lifestyle.png',
    path: '/page/component/lifestyle/lifestyle',
    suggestion: 'lifestyle跳转生活号'
  },
  {
    name: '列表',
    thumb: '/image/icon/form.png',
    path: '/page/component/list/list',
    suggestion: 'list列表'
  },
  {
    name: '地图',
    thumb: '/image/icon/map.png',
    path: '/page/component/map/map',
    suggestion: 'map地图'
  },
  {
    name: '结果页',
    thumb: '/image/icon/message.png',
    path: '/page/component/message/massage',
    suggestion: 'message结果页'
  },
  {
    name: '对话框',
    thumb: '/image/icon/modal.png',
    path: '/page/component/modal/modal',
    suggestion: 'modal对话框'
  },
  {
    name: '导航',
    thumb: '/image/icon/navigator.png',
    path: '/page/component/navigator/navigator',
    suggestion: 'navigator导航'
  },
  {
    name: '通告栏',
    thumb: '/image/icon/notice.png',
    path: '/page/component/notice/notice',
    suggestion: 'notice通告栏'
  },
  {
    name: '徽标',
    thumb: '/image/icon/view.png',
    path: '/page/component/badge/badge',
    suggestion: 'badge徽标'
  },
  {
    name: '异常页',
    thumb: '/image/icon/page-result.png',
    path: '/page/component/page-result/page-result',
    suggestion: 'pageresult局部异常页面'
  },
  {
    name: '选择器',
    thumb: '/image/icon/picker.png',
    path: '/page/component/picker/picker',
    suggestion: 'picker选择器'
  },
  {
    name: '选择器视图',
    thumb: '/image/icon/picker-view.png',
    path: '/page/component/picker-view/picker-view',
    suggestion: 'pickerview选择器视图'
  },
  {
    name: '气泡',
    thumb: '/image/icon/popover.png',
    path: '/page/component/popover/popover',
    suggestion: 'popover气泡'
  },
  {
    name: '弹出菜单',
    thumb: '/image/icon/popup.png',
    path: '/page/component/popup/popup',
    suggestion: 'popup弹出菜单'
  },
  {
    name: '进度条',
    thumb: '/image/icon/progress.png',
    path: '/page/component/progress/progress',
    suggestion: 'progress进度条'
  },
  {
    name: '搜索框',
    thumb: '/image/icon/search-bar.png',
    path: '/page/component/search-bar/search-bar',
    suggestion: 'searchbar搜索框'
  },
  {
    name: '滑动条',
    thumb: '/image/icon/slider.png',
    path: '/page/component/slider/slider',
    suggestion: 'slider滑动条'
  },
  {
    name: '步进器',
    thumb: '/image/icon/stepper.png',
    path: '/page/component/stepper/stepper',
    suggestion: 'stepper步进器'
  },
  {
    name: '步骤条',
    thumb: '/image/icon/steps.png',
    path: '/page/component/steps/steps',
    suggestion: 'steps步骤条'
  },
  {
    name: '可滑动单元格',
    thumb: '/image/icon/swipe-action.png',
    path: '/page/component/swipe-action/swipe-action',
    suggestion: 'swipeaction可滑动单元格手势'
  },
  {
    name: '开关',
    thumb: '/image/icon/switch.png',
    path: '/page/component/switch/switch',
    suggestion: 'switch开关'
  },
  {
    name: '顶部选项卡',
    thumb: '/image/icon/tabs.png',
    path: '/page/component/tabs/tabs',
    suggestion: 'tabs顶部选项卡'
  },
  {
    name: '多行输入框',
    thumb: '/image/icon/textarea.png',
    path: '/page/component/textarea/textarea',
    suggestion: 'textarea多行输入框'
  },
  {
    name: '引导',
    thumb: '/image/icon/tips.png',
    path: '/page/component/tips/tips',
    suggestion: 'tips提示引导'
  },
  {
    name: '纵向选项卡',
    thumb: '/image/icon/vtabs.png',
    path: '/page/component/vtabs/vtabs',
    suggestion: 'vtabs纵向选项卡'
  },
  {
    name: '内嵌webview',
    thumb: '/image/icon/webview.png',
    path: '/page/component/webview/webview',
    suggestion: 'webview内嵌webview'
  },
  {
    name: '基础视图',
    thumb: '/image/icon/view.png',
    path: '/page/component/view/view',
    suggestion: 'view视图容器'
  },
  {
    name: '滑动视图',
    thumb: '/image/icon/swiper.png',
    path: '/page/component/swiper/swiper',
    suggestion: 'swiper滑动视图容器'
  },
  {
    name: '滚动视图',
    thumb: '/image/icon/scroll-view.png',
    path: '/page/component/scroll-view/scroll-view',
    suggestion: 'scrollview滚动视图'
  },
  {
    name: '输入框',
    thumb: '/image/icon/input.png',
    path: '/page/component/input/input',
    suggestion: 'input输入框文本输入'
  },
  {
    name: '文字',
    thumb: '/image/icon/text.png',
    path: '/page/component/text/text',
    suggestion: 'text文本文字'
  },
  {
    name: '容器',
    thumb: '/image/icon/container.png',
    path: '/page/component/container/index',
    suggestion: 'container容器'
  },
  {
    name: '模块标题',
    thumb: '/image/icon/navigator.png',
    path: '/page/component/title/index',
    suggestion: 'title标题'
  },
  {
    name: '列表元素',
    thumb: '/image/icon/list-item.png',
    path: '/page/component/list-item/index',
    suggestion: 'list-item列表元素'
  },
  {
    name: '票券',
    thumb: '/image/icon/coupon.png',
    path: '/page/component/coupon/index',
    suggestion: 'coupon票券优惠券'
  },
  {
    name: '协议',
    thumb: '/image/icon/terms.png',
    path: '/page/component/terms/index',
    suggestion: 'terms协议条款'
  },
  {
    name: '折叠面板',
    thumb: '/image/icon/collapse.png',
    path: '/page/component/collapse/index',
    suggestion: 'collapse折叠更多手风琴'
  },
  {
    name: '标签',
    thumb: '/image/icon/tag.png',
    path: '/page/component/tag/index',
    suggestion: 'tag标签'
  },
  {
    name: '背景蒙层',
    thumb: '/image/icon/mask.png',
    path: '/page/component/mask/mask',
    suggestion: 'mask遮罩背景蒙层'
  },
  {
    name: '遮罩引导',
    thumb: '/image/icon/guide.png',
    path: '/page/component/guide/guide',
    suggestion: 'guide遮罩引导新手指引'
  },
  {
    name: '头像',
    thumb: '/image/icon/avatar.png',
    path: '/page/component/avatar/index',
    suggestion: 'avatar用户头像'
  },
  {
    name: '验证码输入',
    thumb: '/image/icon/verifycode.png',
    path: '/page/component/verify-code/index',
    suggestion: 'verify-code验证码输入框'
  },
  {
    name: '选择输入',
    thumb: '/image/icon/picker.png',
    path: '/page/component/picker-item/index',
    suggestion: 'picker-item选择输入'
  },
  {
    name: '长密码框',
    thumb: '/image/icon/longpassword.png',
    path: '/page/component/long-password/index',
    suggestion: 'long-password长密码输入框'
  },
  {
    name: '多行输入',
    thumb: '/image/icon/textarea.png',
    path: '/page/component/multi-liner/index',
    suggestion: 'multi-liner多行输入textarea'
  },
  {
    name: '按钮',
    thumb: '/image/icon/button.png',
    path: '/page/component/button-ali-ui/index',
    suggestion: 'button按钮'
  },
  {
    name: '开关',
    thumb: '/image/icon/switch.png',
    path: '/page/component/switch-ali-ui/index',
    suggestion: 'switch开关'
  },
  {
    name: '单选',
    thumb: '/image/icon/radio-aliui.png',
    path: '/page/component/radio-ali-ui/index',
    suggestion: 'radio单选'
  },
  {
    name: '分页符',
    thumb: '/image/icon/pagination.png',
    path: '/page/component/pagination/index',
    suggestion: 'pagination分页符'
  },
  {
    name: '字母索引表',
    thumb: '/image/icon/alphabet.png',
    path: '/page/component/alphabet/index',
    suggestion: 'alphabet字母索引表'
  },
  {
    name: '加载',
    thumb: '/image/icon/loading.png',
    path: '/page/component/loading/loading',
    suggestion: 'loading加载动画'
  }
]

const apiList = [
  {
    name: '获取授权码',
    path: '/page/API/get-auth-code/get-auth-code',
    suggestion: 'getauthcode获取授权码'
  },
  {
    name: '获取授信息',
    path: '/page/API/get-user-info/get-user-info',
    suggestion: 'getuserinfo获取用户信息'
  },
  {
    name: '发起支付',
    path: '/page/API/request-payment/request-payment',
    suggestion: 'requestpayment发起支付'
  },
  {
    name: '支付宝卡包',
    path: '/page/API/card-pack/card-pack',
    suggestion: 'cardpack支付宝卡包'
  },
  {
    name: '芝麻信用借还',
    path: '/page/API/zm-credit-borrow/zm-credit-borrow',
    suggestion: 'zmcreditborrow芝麻信用借还'
  },
  {
    name: '文本风险识别',
    path: '/page/API/text-risk-identification/text-risk-identification',
    suggestion: 'textriskidentification风险文本识别'
  },
  { name: '警告框', path: '/page/API/alert/alert', suggestion: 'alert警告框' },
  {
    name: '确认框',
    path: '/page/API/confirm/confirm',
    suggestion: 'confirm确认框'
  },
  { name: '弱提示', path: '/page/API/toast/toast', suggestion: 'toast弱提示' },
  {
    name: '加载提示',
    path: '/page/API/loading/loading',
    suggestion: 'loading加载提示'
  },
  {
    name: '操作菜单',
    path: '/page/API/action-sheet/action-sheet',
    suggestion: 'actionsheet操作菜单'
  },
  {
    name: '设置界面导航栏',
    path: '/page/API/set-navigation-bar/set-navigation-bar',
    suggestion: 'setnavigationbar设置界面导航栏'
  },
  {
    name: '设置optionMenu',
    path: '/page/API/option-menu/option-menu',
    suggestion: 'optionmenu设置optionmenu'
  },
  {
    name: '页面跳转',
    path: '/page/API/navigator/navigator',
    suggestion: 'navigator页面跳转'
  },
  {
    name: '下拉刷新',
    path: '/page/API/pull-down-refresh/pull-down-refresh',
    suggestion: 'pulldownrefresh下拉刷新'
  },
  {
    name: '创建动画',
    path: '/page/API/animation/animation',
    suggestion: 'animation创建动画'
  },
  {
    name: '创建绘画',
    path: '/page/API/canvas/canvas',
    suggestion: 'canvas创建绘画画布'
  },
  {
    name: '选择日期',
    path: '/page/API/date-picker/date-picker',
    suggestion: 'datepicker选择日期选择'
  },
  {
    name: '滚动页面',
    path: '/page/API/page-scroll-to/page-scroll-to',
    suggestion: 'pagescrollto滚动页面'
  },
  {
    name: '节点查询',
    path: '/page/API/create-selector-query/create-selector-query',
    suggestion: 'createselectorquery节点查询'
  },
  {
    name: '联系人',
    path: '/page/API/contact/contact',
    suggestion: 'contact联系人'
  },
  {
    name: '标题栏加载动画',
    path: '/page/API/navigation-bar-loading/navigation-bar-loading',
    suggestion: 'navigationbarloading标题栏加载动画'
  },
  {
    name: '选择城市',
    path: '/page/API/choose-city/choose-city',
    suggestion: 'choosecity选择城市选择'
  },
  {
    name: '隐藏键盘',
    path: '/page/API/keyboard/keyboard',
    suggestion: 'hidekeyboard隐藏键盘'
  },
  {
    name: '级联选择',
    path: '/page/API/multi-level-select/multi-level-select',
    suggestion: 'multilevelselect级联选择'
  },
  {
    name: '选项选择',
    path: '/page/API/options-select/options-select',
    suggestion: 'multilevelselect级联选择'
  },
  {
    name: '获取手机网络状态',
    path: '/page/API/get-network-type/get-network-type',
    suggestion: 'getnetworktype获取手机网络状态'
  },
  {
    name: '获取手机系统信息',
    path: '/page/API/get-system-info/get-system-info',
    suggestion: 'getsysteminfo获取手机系统信息'
  },
  {
    name: '振动',
    path: '/page/API/vibrate/vibrate',
    suggestion: 'vibrate振动'
  },
  {
    name: '剪贴板',
    path: '/page/API/clipboard/clipboard',
    suggestion: 'clipboard剪贴板'
  },
  {
    name: '获取基础库版本',
    path: '/page/API/sdk-version/sdk-version',
    suggestion: 'sdkversion获取基础库版本'
  },
  {
    name: '屏幕亮度',
    path: '/page/API/screen/screen',
    suggestion: 'screen屏幕亮度'
  },
  {
    name: '摇一摇',
    path: '/page/API/watch-shake/watch-shake',
    suggestion: 'watchshake摇一摇'
  },
  {
    name: '拨打电话',
    path: '/page/API/make-phone-call/make-phone-call',
    suggestion: 'makephonecall拨打电话'
  },
  {
    name: '用户截屏事件',
    path: '/page/API/user-capture-screen/user-capture-screen',
    suggestion: 'usercapturescreen用户截屏事件'
  },
  {
    name: '获取服务器时间',
    path: '/page/API/get-server-time/get-server-time',
    suggestion: 'getservertime获取服务器时间'
  },
  {
    name: '内存不足警告',
    path: '/page/API/memory-warning//memory-warning',
    suggestion: 'memorywarning内存不足警告'
  },
  {
    name: '发起HTTP请求',
    path: '/page/API/request/request',
    suggestion: 'request发起请求发起http请求网络'
  },
  {
    name: '上传文件',
    path: '/page/API/upload-file/upload-file',
    suggestion: 'uploadfile上传文件网络'
  },
  {
    name: '下载文件',
    path: '/page/API/download-file/download-file',
    suggestion: 'downloadfile下载文件网络'
  },
  {
    name: 'Websocket',
    path: '/page/API/websocket/websocket',
    suggestion: 'websocket网络'
  },
  {
    name: '图片',
    path: '/page/API/image/image',
    suggestion: 'image图片多媒体'
  },
  {
    name: '获取图片信息',
    path: '/page/API/get-image-info/get-image-info',
    suggestion: 'getimageinfo获取图片信息'
  },
  {
    name: '压缩图片',
    path: '/page/API/compress-image/compress-image',
    suggestion: 'compressimage压缩图片'
  },
  {
    name: '获取当前位置',
    path: '/page/API/get-location/get-location',
    suggestion: 'getlocation获取当前位置地图'
  },
  {
    name: '使用原生地图查看位置',
    path: '/page/API/open-location/open-location',
    suggestion: 'openlocation使用原生地图查看位置'
  },
  {
    name: '打开地图选择位置',
    path: '/page/API/choose-location/choose-location',
    suggestion: 'chooselocation打开地图选择位置'
  },
  {
    name: '缓存',
    path: '/page/API/storage/storage',
    suggestion: 'storage缓存'
  },
  {
    name: '扫码 Scan',
    path: '/page/API/scan-code/scan-code',
    suggestion: 'scan-code扫码'
  },
  {
    name: '自定义分享',
    path: '/page/API/share/share',
    suggestion: 'share自定义分享'
  },
  { name: '文件', path: '/page/API/file/file', suggestion: 'file文件' },
  {
    name: '蓝牙',
    path: '/page/API/bluetooth/bluetooth',
    suggestion: 'bluetooth蓝牙'
  },
  { name: '数据安全', path: '/page/API/rsa/rsa', suggestion: 'rsa数据安全' },
  {
    name: '自定义分析',
    path: '/page/API/report-analytics/report-analytics',
    suggestion: 'reportanalytics数据分析'
  },
  {
    name: '容器事件',
    path: '/page/API/events/events',
    suggestion: 'events容器事件'
  },
  { name: 'OCR', path: '/page/API/ocr/ocr', suggestion: 'ocr' },
  { name: '收藏', path: '/page/API/favorite/favorite', suggestion: 'favorite' }
]

Page({
  data: {
    value: '',
    history: my.getStorageSync({ key: 'searchHistory' }).data || [],
    hot: [
      { name: 'ScrollView', url: '/page/component/scroll-view/scroll-view' },
      { name: '地图', url: '/page/component/map/map' },
      { name: 'Icon', url: '/page/component/icon/icon' },
      { name: 'Card', url: '/page/component/card/card' },
      { name: '获取授权码', url: '/page/API/get-auth-code/get-auth-code' },
      { name: 'Popup', url: '/page/component/popup/popup' },
      { name: '发起HTTP请求', url: '/page/API/request/request' },
      { name: '画布', url: '/page/component/canvas/canvas' },
      { name: '导航', url: '/page/API/navigator/navigator' }
    ],
    componentSuggestions: [],
    apiSuggestions: []
  },
  onLoad() {
    console.log('load', this.data)
    this.setData({
      history: my.getStorageSync({ key: 'searchHistory' }).data
    })
    console.log(my.getStorageSync({ key: 'searchHistory' }).data)
    this.onInput = debounce(this.onInput.bind(this), 400)
    my.setNavigationBar({
      borderBottomColor: '#fff'
    })
  },
  clear() {
    my.confirm({
      content: '确定删除相关历史？',
      success: (res) => {
        if (res.confirm) {
          my.clearStorage()
          this.setData({
            history: []
          })
        }
      }
    })
  },
  onInput(keyword) {
    this.setData({
      value: keyword
    })
    const regExp = /[A-Za-z]/
    if (keyword === '' || (regExp.test(keyword) && keyword.length === 1)) {
      this.setData({
        componentSuggestions: [],
        apiSuggestions: []
      })
      return
    }
    const componentSuggestions = []
    const apiSuggestions = []
    for (let i = 0; i < componentList.length; i++) {
      if (
        componentList[i].suggestion
          .toLocaleLowerCase()
          .indexOf(keyword.toLocaleLowerCase()) != -1
      ) {
        componentSuggestions.push(componentList[i])
      }
    }

    for (let i = 0; i < apiList.length; i++) {
      if (
        apiList[i].suggestion
          .toLocaleLowerCase()
          .indexOf(keyword.toLocaleLowerCase()) != -1
      ) {
        apiSuggestions.push(apiList[i])
      }
    }
    this.setData({ componentSuggestions, apiSuggestions })
  },
  onClear() {
    this.setData({
      value: ''
    })
  },
  onCancel() {
    this.setData({
      componentSuggestions: [],
      apiSuggestions: [],
      value: ''
    })
    my.navigateBack()
  },
  onItemTap({ name }) {
    this.setData({
      value: name
    })

    this.onInput(name)
  },
  onListItemTap(e) {
    const { name, url } = e.target.dataset
    this.addToHistory(name)
    console.log(url)
    my.navigateTo({ url: url })
  },
  addToHistory(keyword) {
    const searchHistory = my.getStorageSync({ key: 'searchHistory' }).data || []
    let index = -1

    for (let i = 0; i < searchHistory.length; i++) {
      if (searchHistory[i].name === keyword) {
        index = i
        break
      }
    }

    let history = []

    if (searchHistory.length >= 8) {
      if (index === -1) {
        history = [{ name: keyword }, ...searchHistory.slice(0, 7)]
      } else {
        searchHistory.splice(index, 1).slice(0, 7)
        history = [{ name: keyword }, ...searchHistory]
      }
    } else {
      if (index === -1) {
        history = [{ name: keyword }, ...searchHistory]
      } else {
        searchHistory.splice(index, 1)
        history = [{ name: keyword }, ...searchHistory]
      }
    }

    my.setStorageSync({
      key: 'searchHistory',
      data: history
    })

    this.setData({
      history
    })
  }
})
