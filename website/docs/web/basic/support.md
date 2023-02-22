# API 支持情况

本文简要归纳了 MorJS 对支付宝小程序 API 的支持情况。

## 域内独有 API

| **名称**    | **功能说明**       | **MorJS 是否支持** |
| ----------- | ------------------ | ------------------ |
| my.sendMtop | 发送一个 mtop 请求 | ✓                  |
| my.on       | 绑定事件           | ✓                  |
| my.call     | 调用 JS API        | ✓                  |

<a name="plxdK"></a>

## 基础

| **名称**                                                                             | **功能说明**                                                         | **MorJS 是否支持** |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | ------------------ |
| [my.canIUse](https://opendocs.alipay.com/mini/api/can-i-use)                         | 判断当前小程序的 API、入参或返回值、组件、属性等在当前版本是否支持。 | ✗                  |
| [my.env](https://opendocs.alipay.com/mini/api/env)                                   | 小程序环境变量对象 API。                                             | ✗                  |
| [my.base64ToArrayBuffer](https://opendocs.alipay.com/mini/api/021zmy)                | 将 Base64 字符串转成 ArrayBuffer 对象。                              | ✗                  |
| [my.arrayBufferToBase64](https://opendocs.alipay.com/mini/api/021zmz)                | 将 ArrayBuffer 对象转成 Base64 字符串。                              | ✗                  |
| [my.getAppIdSync](https://opendocs.alipay.com/mini/api/gazkkm)                       | 同步获取小程序 APPID。                                               | ✗                  |
| [my.getLaunchOptionsSync](https://opendocs.alipay.com/mini/api/getLaunchOptionsSync) | 获取小程序启动时的参数。                                             | ✗                  |
| [my.getRunScene](https://opendocs.alipay.com/mini/api/runscene)                      | 获取当前小程序的运行版本。                                           | ✗                  |
| [my.SDKVersion](https://opendocs.alipay.com/mini/api/sdk-version)                    | 获取基础库版本号。                                                   | ✓                  |
| [my.getEnterOptionsSync](https://opendocs.alipay.com/mini/api/029i75)                | 获取本次小程序启动时的参数。                                         | ✗                  |

<a name="wmx7D"></a>

## 应用级事件

| **名称**                                                                  | **功能说明**                                                    | **MorJS 是否支持** |
| ------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------ |
| [my.onAppHide](https://opendocs.alipay.com/mini/api/tv6qvi)               | 监听小程序切后台事件。                                          | ✗                  |
| [my.offAppHide](https://opendocs.alipay.com/mini/api/dldh0a)              | 取消监听小程序切后台事件。                                      | ✗                  |
| [my.onAppShow](https://opendocs.alipay.com/mini/api/nn7do1)               | 监听小程序切前台事件。                                          | ✗                  |
| [my.offAppShow](https://opendocs.alipay.com/mini/api/tkohmw)              | 取消监听小程序切前台事件。                                      | ✗                  |
| [my.onComponentError](https://opendocs.alipay.com/mini/api/oncomponent)   | 监听小程序自定义组件内部 JS 代码的 error 事件                   | ✗                  |
| [my.offComponentError](https://opendocs.alipay.com/mini/api/offcomponent) | 取消监听小程序自定义组件内部 JS 代码的 error 事件。             | ✗                  |
| [my.onError](https://opendocs.alipay.com/mini/00nnsx)                     | 监听小程序错误事件。                                            | ✗                  |
| [my.offError](https://opendocs.alipay.com/mini/00njqm)                    | 取消监听小程序错误事件。                                        | ✗                  |
| [my.onPageNotFound](https://opendocs.alipay.com/mini/01zdng)              | 监听小程序要打开的页面不存在事件。                              | ✗                  |
| [my.offPageNotFound](https://opendocs.alipay.com/mini/01zarw)             | 取消监听小程序要打开的页面不存在事件。                          | ✗                  |
| [my.onUnhandledRejection](https://opendocs.alipay.com/mini/00nd0f)        | 监听未处理的 Promise 拒绝事件（即  unhandledrejection  事件）。 | ✗                  |
| [my.offUnhandledRejection](https://opendocs.alipay.com/mini/00nfnd)       | 取消监听 unhandledrejection 事件。                              | ✗                  |

<a name="UKBA8"></a>

## 界面

<a name="U2Mo1"></a>

### 导航栏

| **名称**                                                                   | **功能说明**                                                 | **MorJS 是否支持** |
| -------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------ |
| [my.getTitleColor](https://opendocs.alipay.com/mini/api/dplf2s)            | 获取导航栏背景色。                                           | ✓                  |
| [my.hideBackHome](https://opendocs.alipay.com/mini/api/ui-navigate)        | 隐藏 TitleBar 上的返回首页图标，和通用菜单中的返回首页功能。 | ✓                  |
| [my.hideNavigationBarLoading](https://opendocs.alipay.com/mini/api/ncgsga) | 在当前页面隐藏导航条加载动画。                               | ✓                  |
| [my.setNavigationBar](https://opendocs.alipay.com/mini/api/xwq8e6)         | 设置导航栏文字及样式。                                       | ✓                  |
| [my.showNavigationBarLoading](https://opendocs.alipay.com/mini/api/lydg2a) | 在当前页面显示导航条加载动画。                               | ✓                  |

<a name="bQ3xa"></a>

### TabBar

| **名称**                                                            | **功能说明**                       | **MorJS 是否支持** |
| ------------------------------------------------------------------- | ---------------------------------- | ------------------ |
| [my.hideTabBar](https://opendocs.alipay.com/mini/api/at18z8)        | 隐藏 TabBar。                      | ✓                  |
| [my.hideTabBarRedDot](https://opendocs.alipay.com/mini/api/mg428a)  | 隐藏 TabBar 某一项的右上角的红点。 | ✓                  |
| [my.removeTabBarBadge](https://opendocs.alipay.com/mini/api/lpbp5g) | 移除 TabBar 某一项右上角的文本。   | ✓                  |
| [my.setTabBarBadge](https://opendocs.alipay.com/mini/api/qm7t3v)    | 为 TabBar 某一项的右上角添加文本。 | ✓                  |
| [my.setTabBarItem](https://opendocs.alipay.com/mini/api/zu37bk)     | 动态设置 TabBar 某一项的内容。     | ✓                  |
| [my.setTabBarStyle](https://opendocs.alipay.com/mini/api/wcf0sv)    | 动态设置 TabBar 的整体样式。       | ✓                  |
| [my.showTabBar](https://opendocs.alipay.com/mini/api/dpq5dh)        | 显示 TabBar。                      | ✓                  |
| [my.showTabBarRedDot](https://opendocs.alipay.com/mini/api/dquxiq)  | 显示 TabBar 某一项的右上角的红点。 | ✓                  |
| [onTabItemTap](https://opendocs.alipay.com/mini/api/navg36)         | 点击 Tab 时触发。                  | ✗                  |

<a name="I4nt9"></a>

### 路由

| **名称**                                                       | **功能说明**                                                                                                                       | **MorJS 是否支持** |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| [my.switchTab](https://opendocs.alipay.com/mini/api/ui-tabbar) | 跳转到指定 TabBar 页面，并关闭其他所有非 TabBar 页面。                                                                             | ✓                  |
| [my.reLaunch](https://opendocs.alipay.com/mini/api/hmn54z)     | 关闭当前所有页面，跳转到应用内的某个指定页面。                                                                                     | ✓                  |
| [my.redirectTo](https://opendocs.alipay.com/mini/api/fh18ky)   | 关闭当前页面，跳转到应用内的某个指定页面。                                                                                         | ✓                  |
| [my.navigateTo](https://opendocs.alipay.com/mini/api/zwi8gx)   | 从当前页面，跳转到应用内的某个指定页面，可以使用  [my.navigateBack](https://opendocs.alipay.com/mini/api/kc5zbx)  返回到原来页面。 | ✓                  |
| [my.navigateBack](https://opendocs.alipay.com/mini/api/kc5zbx) | 关闭当前页面，返回上一级或多级页面。                                                                                               | ✓                  |

<a name="WeRy1"></a>

### 交互反馈

| **名称**                                                          | **功能说明**                               | **MorJS 是否支持** |
| ----------------------------------------------------------------- | ------------------------------------------ | ------------------ |
| [my.alert](https://opendocs.alipay.com/mini/api/ui-feedback)      | 警告框。                                   | ✓                  |
| [my.confirm](https://opendocs.alipay.com/mini/api/lt3uqc)         | 确认框。                                   | ✓                  |
| [my.prompt](https://opendocs.alipay.com/mini/api/vqpy01)          | 弹出一个对话框，让用户在对话框内输入文本。 | ✓                  |
| [my.showToast](https://opendocs.alipay.com/mini/api/fhur8f)       | 显示一个弱提示，可选择多少秒之后消失。     | ✓                  |
| [my.hideLoading](https://opendocs.alipay.com/mini/api/nzf540)     | 隐藏加载提示。                             | ✓                  |
| [my.hideToast](https://opendocs.alipay.com/mini/api/iygd4e)       | 隐藏弱提示。                               | ✓                  |
| [my.showLoading](https://opendocs.alipay.com/mini/api/bm69kb)     | 显示加载提示。                             | ✓                  |
| [my.showActionSheet](https://opendocs.alipay.com/mini/api/hr092g) | 显示操作菜单。                             | ✓                  |

<a name="uzJEc"></a>

### 下拉刷新

| **名称**                                                                    | **功能说明**                   | **MorJS 是否支持** |
| --------------------------------------------------------------------------- | ------------------------------ | ------------------ |
| [onPullDownRefresh](https://opendocs.alipay.com/mini/api/wo21qk)            | 监听该页面用户的下拉刷新事件。 | ✓                  |
| [my.stopPullDownRefresh](https://opendocs.alipay.com/mini/api/pmhkbb)       | 停止当前页面的下拉刷新。       | ✓                  |
| [my.startPullDownRefresh](https://opendocs.alipay.com/mini/api/ui-pulldown) | 开始下拉刷新。                 | ✓                  |

<a name="e4gAN"></a>

### 联系人

| **名称**                                                                  | **功能说明**                                     | **MorJS 是否支持** |
| ------------------------------------------------------------------------- | ------------------------------------------------ | ------------------ |
| [my.choosePhoneContact](https://opendocs.alipay.com/mini/api/blghgl)      | 选择本地系统通信录中某个联系人的电话。           | ✗                  |
| [my.chooseAlipayContact](https://opendocs.alipay.com/mini/api/ui-contact) | 唤起支付宝通讯录，选择一个或者多个支付宝联系人。 | ✗                  |
| [my.chooseContact](https://opendocs.alipay.com/mini/api/eqx2u5)           | 唤起选择联系人组件。                             | ✗                  |

<a name="iPlbj"></a>

### 选择城市

| **名称**                                                                         | **功能说明**                                                                                | **MorJS 是否支持** |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------ |
| [my.chooseCity](https://opendocs.alipay.com/mini/api/ui-city)                    | 打开城市选择列表。                                                                          | ✓                  |
| [my.offLocatedComplete](https://opendocs.alipay.com/mini/api/offLocatedComplete) | 取消监听地理位置定位完成事件。                                                              | ✗                  |
| [my.onLocatedComplete](https://opendocs.alipay.com/mini/api/krzyo1)              | 监听地理位置定位完成事件。                                                                  | ✗                  |
| [my.setLocatedCity](https://opendocs.alipay.com/mini/api/yw382g)                 | 修改 [my.chooseCity](https://opendocs.alipay.com/mini/api/ui-city) 中的默认定位城市的名称。 | ✗                  |
| [my.regionPicker](https://opendocs.alipay.com/mini/00nd0d)                       | 多级省市区选择器，自带省市区数据源。                                                        | ✗                  |

<a name="IjXRO"></a>

### 选择地区

| **名称**                                                                 | **功能说明**                 | **MorJS 是否支持** |
| ------------------------------------------------------------------------ | ---------------------------- | ------------------ |
| [my.chooseDistrict](https://opendocs.alipay.com/mini/api/choosedistrict) | 使用支付宝统一样式选择地区。 | ✗                  |

<a name="pM0Qq"></a>

### 选择日期

| **名称**                                                      | **功能说明**       | **MorJS 是否支持** |
| ------------------------------------------------------------- | ------------------ | ------------------ |
| [my.datePicker](https://opendocs.alipay.com/mini/api/ui-date) | 打开日期选择列表。 | ✓                  |

<a name="3hTSD"></a>

### 动画

| **名称**                                                                | **功能说明**   | **MorJS 是否支持** |
| ----------------------------------------------------------------------- | -------------- | ------------------ |
| [my.createAnimation](https://opendocs.alipay.com/mini/api/ui-animation) | 创建动画实例。 | ✓                  |

<a name="rIaKn"></a>

### 画布

| **名称**                                                                 | **功能说明**                                                                                                 | **MorJS 是否支持** |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------ |
| [my.createOffscreenCanvas](https://opendocs.alipay.com/mini/api/021zn0)  | 创建离屏 canvas 实例。                                                                                       | ✗                  |
| [my.createCanvasContext](https://opendocs.alipay.com/mini/api/ui-canvas) | 创建 canvas 绘图上下文。                                                                                     | ✓                  |
| [RenderingContext](https://opendocs.alipay.com/mini/01w0it)              | Canvas 绘图上下文                                                                                            | ✗                  |
| [Canvas](https://opendocs.alipay.com/mini/01vzqv)                        | Canvas 实例。                                                                                                | ✓                  |
| [Image](https://opendocs.alipay.com/mini/01vyku)                         | 图片对象，当调用  [Canvas.createImage](https://opendocs.alipay.com/mini/api/createimage)  方法时返回此对象。 | ✓                  |

<a name="nh8Mf"></a>

### 地图

| **名称**                                                           | **功能说明**                                                                                  | **MorJS 是否支持** |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------ |
| [my.createMapContext](https://opendocs.alipay.com/mini/api/ui-map) | 创建并返回一个 map 上下文对象 [mapContext](https://opendocs.alipay.com/mini/api/mapcontext)。 | ✓                  |
| [my.getMapInfo](https://opendocs.alipay.com/mini/api/getmapinfo)   | 获取地图基础信息。                                                                            | ✓                  |

<a name="gMvNr"></a>

### 计算路径

| **名称**                                                                  | **功能说明**                                                                                                                                                       | **MorJS 是否支持** |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| [my.calculateRoute](https://opendocs.alipay.com/mini/api/calculate-route) | 计算路径 API。根据起点和终点的地理位置，智能规划最佳出行路线，并计算不同出行方式下的行动距离和所需时间，默认规划步行路线，支持规划步行、公交、骑行和驾车四种路线。 | ✗                  |

<a name="oExr5"></a>

### 键盘

| **名称**                                                                | **功能说明** | **MorJS 是否支持** |
| ----------------------------------------------------------------------- | ------------ | ------------------ |
| [my.hideKeyboard](https://opendocs.alipay.com/mini/api/ui-hidekeyboard) | 隐藏键盘。   | ✓                  |

<a name="ZxM0t"></a>

### 滚动

| **名称**                                                       | **功能说明**           | **MorJS 是否支持** |
| -------------------------------------------------------------- | ---------------------- | ------------------ |
| [my.pageScrollTo](https://opendocs.alipay.com/mini/api/scroll) | 滚动到页面的目标位置。 | ✓                  |

<a name="XGNpf"></a>

### 节点查询

| **名称**                                                                                   | **功能说明**                                   | **MorJS 是否支持** |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------- | ------------------ |
| [my.createIntersectionObserver](https://opendocs.alipay.com/mini/api/intersectionobserver) | 创建并返回一个 IntersectionObserver 对象实例。 | ✓                  |
| [my.createSelectorQuery](https://opendocs.alipay.com/mini/api/selector-query)              | 获取一个节点查询对象 SelectorQuery。           | ✓                  |

<a name="ZwPou"></a>

### 选项选择器

| **名称**                                                                | **功能说明**                                                                                                                  | **MorJS 是否支持** |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| [my.optionsSelect](https://opendocs.alipay.com/mini/api/options-select) | 类似于 safari 原生 select 的组件，但是功能更加强大，一般用来替代 select，或者 2 级数据的选择。注意不支持 2 级数据之间的联动。 | ✓                  |

<a name="uxvyh"></a>

### 级联选择

| **名称**                                                                       | **功能说明**                                 | **MorJS 是否支持** |
| ------------------------------------------------------------------------------ | -------------------------------------------- | ------------------ |
| [my.multiLevelSelect](https://opendocs.alipay.com/mini/api/multi-level-select) | 级联选择功能，主要使用在于多级关联数据选择。 | ✓                  |

<a name="sQj0a"></a>

### 设置窗口背景

| **名称**                                                                     | **功能说明**                             | **MorJS 是否支持** |
| ---------------------------------------------------------------------------- | ---------------------------------------- | ------------------ |
| [my.setBackgroundColor](https://opendocs.alipay.com/mini/api/set-background) | 动态设置窗口的背景色。                   | ✗                  |
| [my.setBackgroundTextStyle](https://opendocs.alipay.com/mini/api/aamqae)     | 动态设置下拉背景字体、loading 图的样式。 | ✗                  |

<a name="45yOz"></a>

### 设置页面是否支持下拉

| **名称**                                                                    | **功能说明**           | **MorJS 是否支持** |
| --------------------------------------------------------------------------- | ---------------------- | ------------------ |
| [my.setCanPullDown](https://opendocs.alipay.com/mini/api/set-can-pull-down) | 设置页面是否支持下拉。 | ✓                  |

<a name="KrSl4"></a>

### 字体

| **名称**                                                       | **功能说明**       | **MorJS 是否支持** |
| -------------------------------------------------------------- | ------------------ | ------------------ |
| [my.loadFontFace](https://opendocs.alipay.com/mini/api/ggawf0) | 动态加载网络字体。 | ✗                  |

<a name="MF9CS"></a>

# 多媒体

<a name="N60qp"></a>

### 图片

| 名称                                                                                                    | **功能说明**                                 | **MorJS 是否支持** |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------ |
| [my.chooseImage](https://opendocs.alipay.com/mini/api/media/image/my.chooseimage)                       | 拍照或从手机相册中选择图片。                 | ✓                  |
| [my.compressImage](https://opendocs.alipay.com/mini/api/media/image/my.compressimage)                   | 压缩图片。                                   | ✗                  |
| [my.getImageInfo](https://opendocs.alipay.com/mini/api/media/image/my.getimageinfo)                     | 获取图片信息。                               | ✓                  |
| [my.generateImageFromCode](https://opendocs.alipay.com/mini/api/media/image/my.generateimagefromcode)   | 生成二维码，由客户端生成，速度快且不耗流量。 | ✗                  |
| [my.previewImage](https://opendocs.alipay.com/mini/api/media/image/my.previewimage)                     | 预览图片。                                   | ✓                  |
| [my.saveImage](https://opendocs.alipay.com/mini/api/media/image/my.saveimage)                           | 保存在线图片到手机相册。                     | ✗                  |
| [my.saveImageToPhotosAlbum](https://opendocs.alipay.com/mini/api/media/image/my.saveImagetophotosalbum) | 保存图片到系统相册。                         | ✗                  |

<a name="RqTXp"></a>

### 视频

| **名称**                                                                                                | **功能说明**                                                                                                            | **MorJS 是否支持** |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------ |
| [my.createVideoContext](https://opendocs.alipay.com/mini/api/media/video/my.createvideocontext)         | 小程序里内嵌入视频组件，即可上传并播放视频。 my.createVideoContext 用于创建并返回一个 videoId 上下文对象 videoContext。 | ✗                  |
| [my.chooseVideo](https://opendocs.alipay.com/mini/api/media/video/my.choosevideo)                       | 拍摄视频或从手机相册中选视频。                                                                                          | ✗                  |
| [my.saveVideoToPhotosAlbum](https://opendocs.alipay.com/mini/api/media/video/my.savevideotophotosalbum) | 保存视频到相册。                                                                                                        | ✗                  |

<a name="ze4gJ"></a>

### 音频播放

| **名称**                                                                | **功能说明**                                                                              | **MorJS 是否支持** |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------ |
| [my.createInnerAudioContext](https://opendocs.alipay.com/mini/00bg4q)   | 在小程序内创建并返回内部音频（与背景音频相对应） innerAudioContext 对象。又称“前景音频”。 | ✗                  |
| [my.getAvailableAudioSources](https://opendocs.alipay.com/mini/00bg4t)  | 获取当前支持的音频输入源。                                                                | ✗                  |
| [my.getBackgroundAudioManager](https://opendocs.alipay.com/mini/00bifu) | 获取后台音频播放器，与前景音频相对应，可以在用户离开当前小程序后继续播放音频。            | ✗                  |
| [my.offAudioInterruptionBegin](https://opendocs.alipay.com/mini/00jim9) | 取消监听音频因为系统占用而被中断的开始事件。                                              | ✗                  |
| [my.offAudioInterruptionEnd](https://opendocs.alipay.com/mini/00jfja)   | 取消监听音频被中断的结束事件。                                                            | ✗                  |
| [my.onAudioInterruptionBegin](https://opendocs.alipay.com/mini/00jim8)  | 监听音频因为系统占用而被中断的开始事件。                                                  | ✗                  |
| [my.onAudioInterruptionEnd](https://opendocs.alipay.com/mini/00jgot)    | 监听音频被中断的结束事件。                                                                | ✗                  |

<a name="YkrUx"></a>

### lottie 动画

| **名称**                                                                           | **功能说明**                                                                                                                                                                                                             | **MorJS 是否支持** |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| [my.createLottieContext](https://opendocs.alipay.com/mini/api/createlottiecontext) | Lottie 是一个用于 Web 和 iOS 的移动库，可使用 Bodymovin 解析以 JSON 格式导出的 Adobe After Effects 动画，并将其本地呈现在移动设备上。<br />my.createLottieContext 用于创建并返回一个 lottieId 上下文对象 lottieContext。 | ✗                  |

<a name="Crcmw"></a>

# 缓存

| **名称**                                                             | **功能说明**                                        | **MorJS 是否支持** |
| -------------------------------------------------------------------- | --------------------------------------------------- | ------------------ |
| [my.setStorage](https://opendocs.alipay.com/mini/api/eocm6v)         | 将数据存储在本地缓存中指定的 key 中的异步接口。     | ✓                  |
| [my.setStorageSync](https://opendocs.alipay.com/mini/api/cog0du)     | 同步将数据存储在本地缓存中指定的 key 中的同步接口。 | ✓                  |
| [my.getStorage](https://opendocs.alipay.com/mini/api/azfobl)         | 获取缓存数据的异步接口。                            | ✓                  |
| [my.getStorageSync](https://opendocs.alipay.com/mini/api/ox0wna)     | 获取缓存数据的同步接口。                            | ✓                  |
| [my.removeStorage](https://opendocs.alipay.com/mini/api/of9hze)      | 删除缓存数据的异步接口。                            | ✓                  |
| [my.removeStorageSync](https://opendocs.alipay.com/mini/api/ytfrk4)  | 删除缓存数据的同步接口。                            | ✓                  |
| [my.clearStorage](https://opendocs.alipay.com/mini/api/storage)      | 清除本地数据缓存的异步接口。                        | ✓                  |
| [my.clearStorageSync](https://opendocs.alipay.com/mini/api/ulv85u)   | 清除本地数据缓存的同步接口。                        | ✓                  |
| [my.getStorageInfo](https://opendocs.alipay.com/mini/api/zvmanq)     | 获取当前 storage 的相关信息的异步接口。             | ✓                  |
| [my.getStorageInfoSync](https://opendocs.alipay.com/mini/api/uw5rdl) | 获取当前 storage 相关信息的同步接口。               | ✓                  |

<a name="Bk7YJ"></a>

# 文件

| **名称**                                                               | **功能说明**                                        | **MorJS 是否支持** |
| ---------------------------------------------------------------------- | --------------------------------------------------- | ------------------ |
| [my.getFileSystemManager](https://opendocs.alipay.com/mini/api/0226oc) | 获取全局唯一的文件管理器。                          | ✗                  |
| [my.getFileInfo](https://opendocs.alipay.com/mini/api/file)            | 获取文件信息。                                      | ✗                  |
| [my.getSavedFileInfo](https://opendocs.alipay.com/mini/api/qrx6ze)     | 获取保存的文件信息。                                | ✗                  |
| [my.getSavedFileList](https://opendocs.alipay.com/mini/api/cgohg1)     | 获取保存的所有文件信息。                            | ✗                  |
| [my.openDocument](https://opendocs.alipay.com/mini/api/mwpprc)         | 在新页面打开文件预览，暂时只支持预览 PDF 格式文件。 | ✗                  |
| [my.removeSavedFile](https://opendocs.alipay.com/mini/api/dgi1fr)      | 删除某个保存的文件。                                | ✗                  |
| [my.saveFile](https://opendocs.alipay.com/mini/api/xbll1q)             | 保存文件到本地。                                    | ✗                  |

<a name="XMiZW"></a>

## 位置

| **名称**                                                           | **功能说明**                     | **MorJS 是否支持** |
| ------------------------------------------------------------------ | -------------------------------- | ------------------ |
| [my.getLocation](https://opendocs.alipay.com/mini/api/mkxuqd)      | 获取用户当前的地理位置信息。     | ✓                  |
| [my.openLocation](https://opendocs.alipay.com/mini/api/as9kin)     | 使用支付宝内置地图查看位置。     | ✓                  |
| [my.chooseLocation](https://opendocs.alipay.com/mini/api/location) | 使用支付宝内置地图选择地理位置。 | ✓                  |

<a name="iIKzr"></a>

## 网络

| **名称**                                                            | **功能说明**                                                                                | **MorJS 是否支持** |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------ |
| [my.request](https://opendocs.alipay.com/mini/api/owycmh)           | 小程序网络请求。                                                                            | ✓                  |
| [my.uploadFile](https://opendocs.alipay.com/mini/api/kmq4hc)        | 上传本地资源到开发者服务器。                                                                | ✓                  |
| [my.downloadFile](https://opendocs.alipay.com/mini/api/xr054r)      | 下载文件资源到本地。                                                                        | ✗                  |
| [my.connectSocket](https://opendocs.alipay.com/mini/api/vx19c3)     | 创建一个  [WebSocket](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket)  的连接。 | ✗                  |
| [my.onSocketOpen](https://opendocs.alipay.com/mini/api/itm5og)      | 监听 WebSocket  连接打开事件。                                                              | ✗                  |
| [my.offSocketOpen](https://opendocs.alipay.com/mini/api/dva3t8)     | 取消监听  WebSocket 连接打开事件。                                                          | ✗                  |
| [my.onSocketError](https://opendocs.alipay.com/mini/api/giu3c2)     | 监听 WebSocket  错误。                                                                      | ✗                  |
| [my.offSocketError](https://opendocs.alipay.com/mini/api/kk7vv7)    | 取消监听 WebSocket  错误。                                                                  | ✗                  |
| [my.sendSocketMessage](https://opendocs.alipay.com/mini/api/mr91d1) | 通过 WebSocket 连接发送数据。                                                               | ✗                  |
| [my.onSocketMessage](https://opendocs.alipay.com/mini/api/gecnap)   | 监听  WebSocket 接受到服务器的消息事件。                                                    | ✗                  |
| [my.offSocketMessage](https://opendocs.alipay.com/mini/api/roziyq)  | 取消监听 WebSocket  接受到服务器的消息事件。                                                | ✗                  |
| [my.closeSocket](https://opendocs.alipay.com/mini/api/network)      | 关闭 WebSocket 连接。                                                                       | ✗                  |
| [my.onSocketClose](https://opendocs.alipay.com/mini/api/foqk6g)     | 监听 WebSocket 关闭。                                                                       | ✗                  |
| [my.offSocketClose](https://opendocs.alipay.com/mini/api/qc4q3t)    | 取消监听 WebSocket 关闭。                                                                   | ✗                  |

<a name="vUFl4"></a>

## 设备

<a name="nOKgz"></a>

### 系统信息

| **名称**                                                             | **功能说明**                 | **MorJS 是否支持** |
| -------------------------------------------------------------------- | ---------------------------- | ------------------ |
| [my.getSystemInfo](https://opendocs.alipay.com/mini/api/system-info) | 获取手机系统信息。           | ✓                  |
| [my.getSystemInfoSync](https://opendocs.alipay.com/mini/api/gawhvz)  | 获取手机系统信息的同步接口。 | ✓                  |

<a name="tMw7o"></a>

### 网络状态

| **名称**                                                                 | **功能说明**             | **MorJS 是否支持** |
| ------------------------------------------------------------------------ | ------------------------ | ------------------ |
| [my.getNetworkType](https://opendocs.alipay.com/mini/api/network-status) | 获取当前网络状态。       | ✓                  |
| [my.onNetworkStatusChange](https://opendocs.alipay.com/mini/api/ympi0l)  | 开始网络状态变化的监听。 | ✓                  |
| [my.offNetworkStatusChange](https://opendocs.alipay.com/mini/api/gxpg1w) | 取消网络状态变化的监听。 | ✓                  |

<a name="yJXCq"></a>

### 剪切板

| **名称**                                                          | **功能说明**     | **MorJS 是否支持** |
| ----------------------------------------------------------------- | ---------------- | ------------------ |
| [my.getClipboard](https://opendocs.alipay.com/mini/api/clipboard) | 获取剪贴板数据。 | ✓                  |
| [my.setClipboard](https://opendocs.alipay.com/mini/api/klbkbp)    | 设置剪贴板数据。 | ✓                  |

<a name="QIZXO"></a>

### 摇一摇

| **名称**                                                    | **功能说明** | **MorJS 是否支持** |
| ----------------------------------------------------------- | ------------ | ------------------ |
| [my.watchShake](https://opendocs.alipay.com/mini/api/shake) | 摇一摇功能。 | ✗                  |

<a name="tnRqm"></a>

### 振动

| **名称**                                                       | **功能说明**             | **MorJS 是否支持** |
| -------------------------------------------------------------- | ------------------------ | ------------------ |
| [my.vibrate](https://opendocs.alipay.com/mini/api/vibrate)     | 调用振动功能。           | ✗                  |
| [my.vibrateLong](https://opendocs.alipay.com/mini/api/ucm2he)  | 较长时间的振动 (400ms)。 | ✗                  |
| [my.vibrateShort](https://opendocs.alipay.com/mini/api/ad6c10) | 较短时间的振动 (40ms)。  | ✗                  |

<a name="FHBcE"></a>

### 加速度计

| **名称**                                                                       | **功能说明**         | **MorJS 是否支持** |
| ------------------------------------------------------------------------------ | -------------------- | ------------------ |
| [my.startAccelerometer](https://opendocs.alipay.com/mini/022hgl)               | 开始监听加速度数据。 | ✗                  |
| [my.stopAccelerometer](https://opendocs.alipay.com/mini/022hgm)                | 停止监听加速度数据。 | ✗                  |
| [my.onAccelerometerChange](https://opendocs.alipay.com/mini/api/accelerometer) | 监听加速度数据。     | ✗                  |
| [my.offAccelerometerChange](https://opendocs.alipay.com/mini/api/kape7p)       | 停止监听加速度数据。 | ✗                  |

<a name="h9OP1"></a>

### 陀螺仪

| **名称**                                                               | **功能说明**             | **MorJS 是否支持** |
| ---------------------------------------------------------------------- | ------------------------ | ------------------ |
| [my.startGyroscope](https://opendocs.alipay.com/mini/022kkm)           | 开始监听陀螺仪数据。     | ✗                  |
| [my.stopGyroscope](https://opendocs.alipay.com/mini/022hgn)            | 停止监听陀螺仪数据。     | ✗                  |
| [my.onGyroscopeChange](https://opendocs.alipay.com/mini/api/gyroscope) | 监听陀螺仪数据变化事件。 | ✗                  |
| [my.offGyroscopeChange](https://opendocs.alipay.com/mini/api/cpt55i)   | 停止监听陀螺仪数据。     | ✗                  |

<a name="IPfKK"></a>

### 罗盘

| **名称**                                                           | **功能说明**       | **MorJS 是否支持** |
| ------------------------------------------------------------------ | ------------------ | ------------------ |
| [my.startCompass](https://opendocs.alipay.com/mini/022kkk)         | 开始监听罗盘数据。 | ✗                  |
| [my.stopCompass](https://opendocs.alipay.com/mini/022kkl)          | 停止监听罗盘数据。 | ✗                  |
| [my.onCompassChange](https://opendocs.alipay.com/mini/api/compass) | 监听罗盘数据。     | ✗                  |
| [my.offCompassChange](https://opendocs.alipay.com/mini/api/xf671t) | 停止监听罗盘数据。 | ✗                  |

<a name="TAaAA"></a>

### 设备方向

| **名称**                                                                                  | **功能说明**           | **MorJS 是否支持** |
| ----------------------------------------------------------------------------------------- | ---------------------- | ------------------ |
| [my.onDeviceMotionChange](https://opendocs.alipay.com/mini/api/my.ondevicemotionchange)   | 监听设备方向变化。     | ✗                  |
| [my.offDeviceMotionChange](https://opendocs.alipay.com/mini/api/my.offdevicemotionchange) | 停止监听设备方向变化。 | ✗                  |

<a name="o3UTb"></a>

### 拨打电话

| **名称**                                                            | **功能说明** | **MorJS 是否支持** |
| ------------------------------------------------------------------- | ------------ | ------------------ |
| [my.makePhoneCall](https://opendocs.alipay.com/mini/api/macke-call) | 拨打电话。   | ✓                  |

<a name="97n06"></a>

### 获取服务器时间

| **名称**                                                                 | **功能说明**                 | **MorJS 是否支持** |
| ------------------------------------------------------------------------ | ---------------------------- | ------------------ |
| [my.getServerTime](https://opendocs.alipay.com/mini/api/get-server-time) | 获取当前服务器时间的毫秒数。 | ✗                  |

<a name="seXd4"></a>

### 用户截屏事件

| **名称**                                                                           | **功能说明**                 | **MorJS 是否支持** |
| ---------------------------------------------------------------------------------- | ---------------------------- | ------------------ |
| [my.onUserCaptureScreen](https://opendocs.alipay.com/mini/api/user-capture-screen) | 监听用户发起的主动截屏事件。 | ✗                  |
| [my.offUserCaptureScreen](https://opendocs.alipay.com/mini/api/umdxbg)             | 取消监听截屏事件。           | ✗                  |

<a name="lCKtC"></a>

### 屏幕亮度

| **名称**                                                                         | **功能说明**               | **MorJS 是否支持** |
| -------------------------------------------------------------------------------- | -------------------------- | ------------------ |
| [my.setKeepScreenOn](https://opendocs.alipay.com/mini/api/qx0sap)                | 设置是否保持屏幕长亮状态。 | ✗                  |
| [my.getScreenBrightness](https://opendocs.alipay.com/mini/api/screen-brightness) | 获取屏幕亮度。             | ✗                  |
| [my.setScreenBrightness](https://opendocs.alipay.com/mini/api/ccf32t)            | 设置屏幕亮度。             | ✗                  |

<a name="ru4Tk"></a>

### 设置

| **名称**                                                      | **功能说明**                                 | **MorJS 是否支持** |
| ------------------------------------------------------------- | -------------------------------------------- | ------------------ |
| [my.openSetting](https://opendocs.alipay.com/mini/api/qflu8f) | 打开小程序设置界面，返回用户权限设置的结果。 | ✗                  |
| [my.getSetting](https://opendocs.alipay.com/mini/api/xmk3ml)  | 获取用户的当前设置。                         | ✗                  |

<a name="Mm9bw"></a>

### 添加手机联系人

| **名称**                                                           | **功能说明**                                                                             | **MorJS 是否支持** |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ------------------ |
| [my.addPhoneContact](https://opendocs.alipay.com/mini/api/contact) | 用户可以选择将该表单以“创建新联系人”或“添加到现有联系人”的方式，写入到手机系统的通讯录。 | ✗                  |

<a name="HjOJo"></a>

### 无障碍

| **名称**                                                                                      | **功能说明**                 | **MorJS 是否支持** |
| --------------------------------------------------------------------------------------------- | ---------------------------- | ------------------ |
| [my.isScreenReaderEnabled](https://opendocs.alipay.com/mini/api/device/isscreenreaderenabled) | 获取设备是否开启无障碍模式。 | ✗                  |

<a name="cxlGn"></a>

### 权限引导

| **名称**                                                                 | **功能说明**                                                            | **MorJS 是否支持** |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ------------------ |
| [my.showAuthGuide](https://opendocs.alipay.com/mini/api/show-auth-guide) | 通过权限引导模块以图文等形式向用户弹出 Dialog，引导用户打开相应的权限。 | ✗                  |

<a name="tcRoe"></a>

### 扫码

| **名称**                                             | **功能说明**     | **MorJS 是否支持** |
| ---------------------------------------------------- | ---------------- | ------------------ |
| [my.scan](https://opendocs.alipay.com/mini/api/scan) | 调用扫一扫功能。 | ✗                  |

<a name="RgwDY"></a>

### 内存不足告警

| **名称**                                                           | **功能说明**                 | **MorJS 是否支持** |
| ------------------------------------------------------------------ | ---------------------------- | ------------------ |
| [my.onMemoryWarning](https://opendocs.alipay.com/mini/api/rb9o8p)  | 开始监听内存不足的告警事件。 | ✗                  |
| [my.offMemoryWarning](https://opendocs.alipay.com/mini/api/hszexr) | 停止监听内存不足的告警事件。 | ✗                  |

<a name="OhRVb"></a>

### 获取设备电量

| **名称**                                                             | **功能说明**         | **MorJS 是否支持** |
| -------------------------------------------------------------------- | -------------------- | ------------------ |
| [my.getBatteryInfo](https://opendocs.alipay.com/mini/api/nrnziy)     | 获取电量的异步接口。 | ✗                  |
| [my.getBatteryInfoSync](https://opendocs.alipay.com/mini/api/vf7vn3) | 获取电量的同步接口。 | ✗                  |

<a name="DWIQv"></a>

#### 低功耗蓝牙

| **名称**                                                                             | **功能说明**                                                                                                                                             | **MorJS 是否支持** |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| [my.connectBLEDevice](https://opendocs.alipay.com/mini/api/tmew6e)                   | 连接低功耗蓝牙设备。                                                                                                                                     | ✗                  |
| [my.setBLEMTU](https://opendocs.alipay.com/mini/api/my.setblemtu)                    | 设置低功耗蓝牙设备最大传输单元（MTU）。需在 [my.connectBLEDevice](https://opendocs.alipay.com/mini/api/tmew6e) 调用成功后调用，mtu 设置范围（22, 512）。 | ✗                  |
| [my.getBLEMTU](https://opendocs.alipay.com/mini/api/my.getblemtu)                    | 获取低功耗蓝牙设备的最大传输单元（MTU）。                                                                                                                | ✗                  |
| [my.disconnectBLEDevice](https://opendocs.alipay.com/mini/api/yqrmmk)                | 断开与低功耗蓝牙设备的连接。                                                                                                                             | ✗                  |
| [my.writeBLECharacteristicValue](https://opendocs.alipay.com/mini/api/vmp2r4)        | 向低功耗蓝牙设备特征值中写入数据。                                                                                                                       | ✗                  |
| [my.readBLECharacteristicValue](https://opendocs.alipay.com/mini/api/zro0ka)         | 读取低功耗蓝牙设备特征值中的数据。                                                                                                                       | ✗                  |
| [my.notifyBLECharacteristicValueChange](https://opendocs.alipay.com/mini/api/pdzk44) | 启用低功耗蓝牙设备特征值变化时的 notify 功能。                                                                                                           | ✗                  |
| [my.getBLEDeviceServices](https://opendocs.alipay.com/mini/api/uzsg75)               | 获取蓝牙设备所有 service（服务）。                                                                                                                       | ✗                  |
| [my.getBLEDeviceRSSI](https://opendocs.alipay.com/mini/api/my.getbledevicerssi)      | 获取蓝牙低功耗设备的信号强度（Received Signal Strength Indication, RSSI）。                                                                              | ✗                  |
| [my.getBLEDeviceCharacteristics](https://opendocs.alipay.com/mini/api/fmg9gg)        | 获取蓝牙设备所有 characteristic（特征值）。                                                                                                              | ✗                  |
| [my.onBLECharacteristicValueChange](https://opendocs.alipay.com/mini/api/cdu501)     | 监听低功耗蓝牙设备的特征值变化的事件。                                                                                                                   | ✗                  |
| [my.offBLECharacteristicValueChange](https://opendocs.alipay.com/mini/api/dlxobk)    | 监听低功耗蓝牙设备的特征值变化的事件。                                                                                                                   | ✗                  |
| [my.onBLEConnectionStateChanged](https://opendocs.alipay.com/mini/api/utgyiu)        | 监听低功耗蓝牙连接的错误事件，包括设备丢失，连接异常断开等。                                                                                             | ✗                  |
| [my.offBLEConnectionStateChanged](https://opendocs.alipay.com/mini/api/xfuy7k)       | 取消低功耗蓝牙连接状态变化事件的监听。                                                                                                                   | ✗                  |

<a name="W8oky"></a>

#### 传统蓝牙

| **名称**                                                                         | **功能说明**                                                 | **MorJS 是否支持** |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------ |
| [my.openBluetoothAdapter](https://opendocs.alipay.com/mini/api/kunuy4)           | 初始化小程序蓝牙模块。                                       | ✗                  |
| [my.closeBluetoothAdapter](https://opendocs.alipay.com/mini/api/wvko0w)          | 关闭本机蓝牙模块。                                           | ✗                  |
| [my.getBluetoothAdapterState](https://opendocs.alipay.com/mini/api/eid4o6)       | 获取本机蓝牙模块状态。                                       | ✗                  |
| [my.startBluetoothDevicesDiscovery](https://opendocs.alipay.com/mini/api/ksew43) | 获取本机蓝牙模块状态。                                       | ✗                  |
| [my.stopBluetoothDevicesDiscovery](https://opendocs.alipay.com/mini/api/syb4mi)  | 停止搜寻附近的蓝牙外围设备。                                 | ✗                  |
| [my.getBluetoothDevices](https://opendocs.alipay.com/mini/api/pelizr)            | 获取所有已发现的蓝牙设备，包括已经和本机处于连接状态的设备。 | ✗                  |
| [my.getConnectedBluetoothDevices](https://opendocs.alipay.com/mini/api/ge8nue)   | 获取处于已连接状态的设备。                                   | ✗                  |
| [my.onBluetoothDeviceFound](https://opendocs.alipay.com/mini/api/mhzls9)         | 搜索到新的蓝牙设备时触发此事件。                             | ✗                  |
| [my.offBluetoothDeviceFound](https://opendocs.alipay.com/mini/api/snw2t7)        | 移除寻找到新的蓝牙设备事件的监听。                           | ✗                  |
| [my.onBluetoothAdapterStateChange](https://opendocs.alipay.com/mini/api/eegfbk)  | 监听本机蓝牙状态变化的事件。                                 | ✗                  |
| [my.offBluetoothAdapterStateChange](https://opendocs.alipay.com/mini/api/ocgwfe) | 移除本机蓝牙状态变化的事件的监听。                           | ✗                  |
| [my.makeBluetoothPair](https://opendocs.alipay.com/mini/api/makebluetoothpair)   | 蓝牙配对接口。连接蓝牙之前，部分设备需要先配对。             | ✗                  |
| [my.cancelBluetoothPair](https://opendocs.alipay.com/mini/01zarv)                | 取消蓝牙设备配对。                                           | ✗                  |
| [my.getBluetoothPairs](https://opendocs.alipay.com/mini/01zdnf)                  | 获取已经配对的蓝牙设备。                                     | ✗                  |

<a name="8nYTY"></a>

#### iBeacon

| **名称**                                                                                 | **功能说明**                      | **MorJS 是否支持** |
| ---------------------------------------------------------------------------------------- | --------------------------------- | ------------------ |
| [my.startBeaconDiscovery](https://opendocs.alipay.com/mini/api/cy1g7k)                   | 开始搜索附近的 iBeacon 设备。     | ✗                  |
| [my.stopBeaconDiscovery](https://opendocs.alipay.com/mini/api/yp5owa)                    | 停止搜索附近的 iBeacon 设备。     | ✗                  |
| [my.getBeacons](https://opendocs.alipay.com/mini/api/yqleyc)                             | 获取已经搜索到的 iBeacon 设备。   | ✗                  |
| [my.onBeaconUpdate](https://opendocs.alipay.com/mini/api/kvdg9y)                         | 监听 iBeacon 设备的更新事件。     | ✗                  |
| [my.onBeaconServiceChange](https://opendocs.alipay.com/mini/api/rq1dl7)                  | 监听 iBeacon 服务的状态变化。     | ✗                  |
| [my.offBeaconServiceChange](https://opendocs.alipay.com/mini/api/offbeaconservicechange) | 取消监听 iBeacon 服务的状态变化。 | ✗                  |
| [my.offBeaconUpdate](https://opendocs.alipay.com/mini/api/offbeaconupdate)               | 取消监听 iBeacon 设备的更新事件。 | ✗                  |

<a name="klc3y"></a>

### WiFi

| **名称**                                                                     | **功能说明**                                                                                                            | **MorJS 是否支持** |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------ |
| [my.startWifi](https://opendocs.alipay.com/mini/api/startwifi)               | 初始化 Wi-Fi 模块。                                                                                                     | ✗                  |
| [my.stopWifi](https://opendocs.alipay.com/mini/api/stopwifi)                 | 关闭 Wi-Fi 模块。                                                                                                       | ✗                  |
| [my.connectWifi](https://opendocs.alipay.com/mini/api/connectwifi)           | 连接 Wi-Fi。若已知 Wi-Fi 信息，可以直接利用该接口连接。                                                                 | ✗                  |
| [my.getWifiList](https://opendocs.alipay.com/mini/api/getwifilist)           | 请求获取 Wi-Fi 列表，在 onGetWifiList 注册的回调中返回 wifiList 数据。iOS 将跳转到系统的 Wi-Fi 界面，Android 不会跳转。 | ✗                  |
| [my.setWifiList](https://opendocs.alipay.com/mini/api/setwifilist)           | 在  `my.onGetWifiList`  回调触发后，利用接口设置 wifiList 中 AP 的相关信息。                                            | ✗                  |
| [my.onWifiConnected](https://opendocs.alipay.com/mini/api/onwificonnected)   | 监听连接上 Wi-Fi 的事件。                                                                                               | ✗                  |
| [my.offWifiConnected](https://opendocs.alipay.com/mini/api/offwificonnected) | 取消监听连接上 Wi-Fi 的事件。                                                                                           | ✗                  |
| [my.onGetWifiList](https://opendocs.alipay.com/mini/api/ongetwifilist)       | 监听在获取到 Wi-Fi 列表数据时的事件，在回调中将返回 wifiList。                                                          | ✗                  |
| [my.offGetWifiList](https://opendocs.alipay.com/mini/api/offgetwifilist)     | 取消监听在获取到 Wi-Fi 列表数据时的事件。                                                                               | ✗                  |
| [my.getConnectedWifi](https://opendocs.alipay.com/mini/api/getconnectedwifi) | 获取已连接中的 Wi-Fi 信息。                                                                                             | ✗                  |
| [my.registerSSID](https://opendocs.alipay.com/mini/api/register)             | 信任该 SSID，对于需要 Portal 认证的 WIFI，不会弹出 portal 认证页面。                                                    | ✗                  |
| [my.unregisterSSID](https://opendocs.alipay.com/mini/api/unregister)         | 不再信任该 SSID，对于需要 Portal 认证的 WIFI，继续弹出 portal 认证页面。                                                | ✗                  |

<a name="Uvz0L"></a>

# worker

| **名称**                                                             | **功能说明**            | **MorJS 是否支持** |
| -------------------------------------------------------------------- | ----------------------- | ------------------ |
| [my.createWorker](https://opendocs.alipay.com/mini/api/createworker) | 创建一个  Worker 线程。 | ✗                  |

<a name="5FIgO"></a>

## 数据安全

| **名称**                                                 | **功能说明** | **MorJS 是否支持** |
| -------------------------------------------------------- | ------------ | ------------------ |
| [my.rsa](https://opendocs.alipay.com/mini/api/data-safe) | 非对称加密。 | ✗                  |

<a name="mRe4K"></a>

## 分享

| **名称**                                                                                                                                             | **功能说明**                                                  | **MorJS 是否支持** |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------ |
| [onShareAppMessage](https://opendocs.alipay.com/mini/framework/page-detail#%E9%A1%B5%E9%9D%A2%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86%E5%87%BD%E6%95%B0) | 在 Page 中定义 onShareAppMessage 函数，设置该页面的分享信息。 | ✗                  |
| [my.hideShareMenu](https://opendocs.alipay.com/mini/api/share_app)                                                                                   | 隐藏分享按钮。                                                | ✗                  |
| [my.showSharePanel](https://opendocs.alipay.com/mini/api/omg2ye)                                                                                     | 唤起分享面板。                                                | ✗                  |

<a name="2N7Gw"></a>

## 自定义通用菜单

| **名称**                                                                       | **功能说明**                                       | **MorJS 是否支持** |
| ------------------------------------------------------------------------------ | -------------------------------------------------- | ------------------ |
| [my.hideAddToDesktopMenu](https://opendocs.alipay.com/mini/api/optionmenuitem) | 隐藏当前页面通用菜单中的  **添加到桌面**  功能。   | ✗                  |
| [my.hideAllAddToDesktopMenu](https://opendocs.alipay.com/mini/api/fdaplu)      | 隐藏所有页面的通用菜单中的  **添加到桌面**  功能。 | ✗                  |

<a name="oSugF"></a>

## 更新管理

| **名称**                                                           | **功能说明**                                                                    | **MorJS 是否支持** |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------- | ------------------ |
| [my.getUpdateManager](https://opendocs.alipay.com/mini/api/zdblqg) | 创建一个 UpdateManager 对象，获取全局唯一的版本更新管理器，用于管理小程序更新。 | ✗                  |
| [UpdateManager](https://opendocs.alipay.com/mini/api/ngwgfi)       | UpdateManager 对象，用来管理更新，可通过  my.getUpdateManager  接口获取实例。   | ✗                  |

<a name="Z1l89"></a>

## web-view 组件控制

| **名称**                                                                        | **功能说明**                                                                                                             | **MorJS 是否支持** |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| [my.createWebViewContext](https://opendocs.alipay.com/mini/api/webview-context) | 通过创建`webviewContext`提供从小程序向`web-view`发送消息的能力。创建并返回  `web-view`  上下文  `webViewContext`  对象。 | ✓                  |

<a name="5oexg"></a>

## 跳转支付宝应用或页面

| **名称**                                                                                | **功能说明**                                 | **MorJS 是否支持** |
| --------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------ |
| [my.ap.navigateToAlipayPage](https://opendocs.alipay.com/mini/api/navigatetoalipaypage) | 小程序中跳转到支付宝官方业务或运营活动页面。 | ✗                  |

<a name="aWNIa"></a>

## 升级支付宝最新版本

| **名称**                                                                            | **功能说明**               | **MorJS 是否支持** |
| ----------------------------------------------------------------------------------- | -------------------------- | ------------------ |
| [my.ap.updateAlipayClient](https://opendocs.alipay.com/mini/api/updatealipayclient) | 打开支付宝客户端升级界面。 | ✗                  |

<a name="iocwh"></a>

## 开放能力 API

<a name="aa6vQ"></a>

### 基础能力

| **能力名称**                                                                  | **API 名称**                                                                        | **功能说明**                                                                 | **MorJS 是否支持** |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------ |
| [小程序相互跳转](https://opendocs.alipay.com/mini/introduce/open-miniprogram) | [my.navigateBackMiniProgram](https://opendocs.alipay.com/mini/api/open-miniprogram) | 跳转回上一个小程序的 API，只有当另一个小程序跳转到当前小程序时才能调用成功。 | ✗                  |
|                                                                               | [my.navigateToMiniProgram](https://opendocs.alipay.com/mini/api/yz6gnx)             | 跳转到其他小程序。                                                           | ✗                  |
| [用户授权](https://docs.alipay.com/mini/introduce/authcode)                   | [my.getAuthCode](https://docs.alipay.com/mini/api/openapi-authorize)                | 获取用户授权码。                                                             | ✓                  |

<a name="Q0yCh"></a>

### 支付能力

| **能力名称**                                                 | **API 名称**                                                    | **功能说明**     | **MorJS 是否支持** |
| ------------------------------------------------------------ | --------------------------------------------------------------- | ---------------- | ------------------ |
| [小程序支付](https://opendocs.alipay.com/mini/introduce/pay) | [my.tradePay](https://opendocs.alipay.com/mini/api/openapi-pay) | 小程序唤起支付。 | ✗                  |

<a name="Kk1CH"></a>

### 资金能力

| **能力名称**                                                             | **API 名称**                                                    | **功能说明**                              | **MorJS 是否支持** |
| ------------------------------------------------------------------------ | --------------------------------------------------------------- | ----------------------------------------- | ------------------ |
| [资金授权](https://opendocs.alipay.com/mini/introduce/pre-authorization) | [my.tradePay](https://opendocs.alipay.com/mini/api/openapi-pay) | 小程序支付接口。                          | ✗                  |
| [周期扣款](https://opendocs.alipay.com/mini/006srl)                      | [my.paySignCenter](https://opendocs.alipay.com/mini/006v6d)     | 在支付宝小程序内启动一个代扣 HTML5 服务。 | ✗                  |

<a name="eP10t"></a>

### 会员能力

| **能力名称**                                                                | **API 名称**                                                                                   | **功能说明**                                                               | **MorJS 是否支持** |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------ |
| [获取会员基础信息](https://opendocs.alipay.com/mini/introduce/twn8vq)       | [my.getAuthCode](https://opendocs.alipay.com/mini/api/openapi-authorize)                       | 用户授权获取授权 code。注意在此注册流程中，scopes 参数请传递 “auth_base”。 | ✗                  |
|                                                                             | [my.getOpenUserInfo](https://opendocs.alipay.com/mini/api/ch8chh)                              | 获取会员基础信息。                                                         | ✗                  |
| [获取会员手机号](https://opendocs.alipay.com/mini/introduce/getphonenumber) | [my.getPhoneNumber](https://opendocs.alipay.com/mini/api/getphonenumber)                       | 获取会员手机号码。                                                         | ✗                  |
| [获取会员收货地址](https://opendocs.alipay.com/mini/introduce/getaddress)   | [my.getAddress](https://opendocs.alipay.com/mini/api/lymgfk)                                   | 获取会员收货地址。                                                         | ✗                  |
| [商户会员卡](https://opendocs.alipay.com/mini/introduce/card)               | [my.addCardAuth](https://opendocs.alipay.com/mini/api/add-card-auth)                           | 小程序内唤起开卡页面。                                                     | ✗                  |
|                                                                             | [my.openCardList](https://opendocs.alipay.com/mini/api/qxxpsh)                                 | 打开支付宝卡包中的“卡”列表。                                               | ✗                  |
|                                                                             | [my.openMerchantCardList](https://opendocs.alipay.com/mini/api/axfplw)                         | 打开当前用户领取某个商户的“卡”列表。                                       | ✗                  |
|                                                                             | [my.openCardDetail](https://opendocs.alipay.com/mini/api/card-voucher-ticket#myopencarddetail) | 打开当前用户领取某张卡的详情页。                                           | ✗                  |

<a name="AsJD2"></a>

### 营销能力

| **能力名称**                                                         | **API 名称**                                                                                                                                         | **功能说明**                                 | **MorJS 是否支持** |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------ |
| [支付宝卡包](https://opendocs.alipay.com/mini/introduce/voucher)     | [my.openVoucherList](https://opendocs.alipay.com/mini/api/vq3mgn)                                                                                    | 打开支付宝卡包中的“劵”列表。                 | ✗                  |
|                                                                      | [my.openMerchantVoucherList](https://opendocs.alipay.com/mini/api/sgvgu6)                                                                            | 打开当前用户领取某个商户的“劵”列表。         | ✗                  |
|                                                                      | [my.openVoucherDetail](https://opendocs.alipay.com/mini/api/card-voucher-ticket#myopenvoucherdetail)                                                 | 打开当前用户领取某张劵的详情页（非口碑劵）。 | ✗                  |
|                                                                      | [my.openKBVoucherDetail](https://opendocs.alipay.com/mini/api/ga4obi)                                                                                | 打开当前用户领取某张劵的详情页（口碑劵）。   | ✗                  |
|                                                                      | [my.openTicketList](https://opendocs.alipay.com/mini/api/ezt6u3)                                                                                     | 打开支付宝卡包中的“票”列表。                 | ✗                  |
|                                                                      | [my.openMerchantTicketList](https://opendocs.alipay.com/mini/api/yee76y)                                                                             | 打开当前用户领取某个商户的“票”列表。         | ✗                  |
|                                                                      | [my.openTicketDetail](https://opendocs.alipay.com/mini/api/ry7ftz)                                                                                   | 打开当前用户领取某张票的详情页。             | ✗                  |
| [运动数据](https://opendocs.alipay.com/mini/introduce/rundata)       | [my.getRunData](https://opendocs.alipay.com/mini/api/gxuu7v)                                                                                         | 获取步数。                                   | ✗                  |
| [小程序自定义分享](https://opendocs.alipay.com/mini/introduce/share) | [onShareAppMessage](https://opendocs.alipay.com/mini/framework/page-detail#%E9%A1%B5%E9%9D%A2%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86%E5%87%BD%E6%95%B0) | 设置页面的分享信息。                         | ✗                  |

<a name="lGdzd"></a>

### 安全能力

| **能力名称**                                                                    | **API 名称**                                                                          | **功能说明**             | **MorJS 是否支持** |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------ | ------------------ |
| [先享后付保障](https://opendocs.alipay.com/mini/introduce/non-sufficient-funds) | [my.ap.nsf](https://opendocs.alipay.com/mini/api/nsf)                                 | 先享后付保障。           | ✗                  |
| [营销反作弊](https://opendocs.alipay.com/mini/introduce/antimarketcheat)        | [my.ap.preventCheat](https://opendocs.alipay.com/mini/api/antimarketcheat)            | 营销反作弊。             | ✗                  |
| [文本风险识别](https://opendocs.alipay.com/mini/introduce/text-identification)  | [my.textRiskIdentification](https://opendocs.alipay.com/mini/api/text-identification) | 文本风险识别（用户端）。 | ✗                  |
| [图片内容安全](https://opendocs.alipay.com/mini/introduce/img_risk)             | [my.ap.imgRisk](https://opendocs.alipay.com/mini/api/img_risk)                        | 图片提交接口。           | ✗                  |
|                                                                                 | [my.ap.imgRiskCallback](https://opendocs.alipay.com/mini/api/ze6675)                  | 风险结果查询接口。       | ✗                  |

<a name="bSoMX"></a>

## 模板配置

| **名称**                                                                     | **功能说明**                                                                                                                           | **MorJS 是否支持** |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| [my.getExtConfig](https://opendocs.alipay.com/mini/api/getExtConfig)         | 获取  [模板小程序](https://opendocs.alipay.com/mini/isv/creatminiapp#%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E)  自定义数据字段的异步接口。 | ✗                  |
| [my.getExtConfigSync](https://opendocs.alipay.com/mini/api/getExtConfigSync) | 获取  [模板小程序](https://opendocs.alipay.com/mini/isv/creatminiapp#%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E)  自定义数据字段的同步接口。 | ✗                  |
