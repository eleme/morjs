# 支付宝转微信

## 自定义组件

### props 必须完整

- 问题表现：在支付宝小程序中，你可以在`props`中没有定义某个属性，但是在实际使用中直接引用`this.props.xx`，但是由于在微信小程序中需要对`props`进行分析并动态赋值，因此必须要有完整的`props`列表
- 解决方案：将所有使用到的`props`属性都声明在`props`中

### props 中的函数名字必须为 on 开头的 onEvent 格式

- 问题表现：在支付宝中，自定义组件对外的函数入参都必须要求以 on 开头
- 解决方案：

```javascript
aComponent({
  props: {
    onClick() {} // 必须为onX的格式
  }
})
```

### 样式覆盖优先级

- 问题表现：微信中自定义组件的样式无法直接被覆盖
- 解决方案：传入自定义组件的样式优先级比组件内的高即可

```html
<view class="content">
  <lazy-load className="image"></lazy-load>
</view>
```

```css
.content .image {
  width: 100rpx;
  height: 100rpx;
}
```

### 获取 props 中的函数返回值

- 问题表现：在支付宝小程序中，可以直接通过`const result = this.props.onClick()`来获取到传入的函数的返回值。由于在微信等端外小程序中事件处理机制差异过大，因此需要通过异步方式来处理。
- 解决方案：**在所有获取函数返回值的地方都通过 await 来获取即可**。而传入的函数不需要做任何改动，按照正常的方式 return 即可
- 参考代码：

传入方

```javascript
aPage({
  onComponentClick(...args) {
    console.log(args)
    return 'page-data' // 正常返回即可，不需要做任何特殊处理
  }
})
```

调用方

```javascript
aComponent({
  methods: {
    async onClick() {
			const result = await this.props.onClick('1111111', '22222') // 需要await来拿返回值
			console.log(result) // 打印输出 'page-data'
    },
  },
},
```

### 获取各种事件中目标元素 data 属性时优先从 currentTarget 获取

- 问题表现：微信中元素产生 tap 或 touch 事件时，target 中元素 data 属性为空，只有 currentTarget 属性有值
- 解决方案：优先从 currentTarget 获取

```javascript
aPage({
  onOpenItem(e) {
    const target = e.currentTarget || e.target
    const { index, type } = target.dataset || {}

    console.log(index, type)
  }
})
```

### 不能使用 default slot 默认插槽

- 问题表现：在支付宝中可以设置组件的 slot 的默认内容，在组件调用方不传的 slot 的内容的时候默认展示出来。但是由于微信尚未支持该功能。可参考微信的回答：[https://developers.weixin.qq.com/community/develop/doc/0008a04f2b0f289fa907b450b56000](https://developers.weixin.qq.com/community/develop/doc/0008a04f2b0f289fa907b450b56000)
- 解决方案：目前没有办法抹平这种底层级别的差异，因此需要组件都自己传 slot 的内容来确保双端兼容性

### 微信端没有 $spliceData

- 问题表现：在微信小程序没有 spliceData
- 解决方案：只使用 setData 或者判断环境再使用

### 使用 querySelector 需要甄别实例环境

- 问题表现：默认情况下通过`aBridge`来调用`querySelector`这个 api，由于`aBridge`无法动态去识别当前运行的实例环境，在微信小程序的自定义组件或包含自定义组件的页面中会异常。
- 解决方案：微信端在自定义组件或包含自定义组件的页面中，应使用  `this.createSelectorQuery()`  来代替。可参考微信的官方文档：[https://developers.weixin.qq.com/miniprogram/dev/api/wxml/wx.createSelectorQuery.html](https://developers.weixin.qq.com/miniprogram/dev/api/wxml/wx.createSelectorQuery.html)

---

## AXML

### AXML 中不能使用 Array 的 slice/includes/indexOf 方法

- 问题表现：在微信小程序中，在 WXML 里面调用 Array 的 slice 方法是不会生效的，例如：'`wx:for="arr.slice(1)"`'这样的写法是不会有效的
- 解决方案：在 JS 中处理成 data 变量或者使用 sjs 方法做一层封装。

### AXML 中不能使用 toLowerCase 或 toUpperCase 方法

- 问题表现：在微信小程序中，在 WXML 内调用`toLowerCase`或者是`toUpperCase`方法都是不会有效的，例如：`"{{'test'.toUpperCase()}}"`或者`"{{'TEST'.toLowerCase()}}"`这样的写法是不会生效的
- 解决方案：在 JS 中处理成 data 变量或者使用 sjs 方法做一层封装。

### AXML 中不能使用 typeof 运算符

- 问题表现：在微信小程序中，并没有在 WXML 中支持 typeof 运算符，直接使用 typeof 会直接报错
- 解决方案：在 JS 中处理成 data 变量或者使用 sjs 方法做一层封装。

### AXML 中动态定义高度要加 PX 单位

- 问题表现：在微信小程序中，不加单位，高度不生效
- 解决方案：加单位

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/27413/1595323486788-7c509cb9-7d96-4ce2-872d-75cb285f3d45.png#height=1096&id=eF6j5&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1096&originWidth=2008&originalType=binary&ratio=1&size=1657788&status=done&style=none&width=2008)

### AXML 中的 style 属性不能传递对象

- 问题表现：在支付宝小程序中传入 style 对象，解析为微信小程序代码则会出现错误
- 问题解决：在支付宝小程序中使用字符串拼接（可引入变量）
- 参考代码：

​

有问题的写法 👇🏻

```html
<!-- 支付宝 -->
<view style="{{width: width}}">
  <!-- 微信未做处理，会报错 -->
  <view style="{{width: width}}"></view
></view>
```

改为 👇🏻 即可

```html
<!-- 支付宝 -->
<view style="width: {{width}}"></view>
```

### AXML 中不支持 ```` 模版字符串

- 问题表现：微信小程序中的 {{ }} 中无法使用模版字符串
- 问题解决：将模版字符串替换为字符串拼接 `+`
- 参考代码：

​

```html
<view style="{{zIndex ? `z-index: ${zIndex};` : ''}}"></view>
```

改为 👇🏻 即可

```html
<view style="{{zIndex ? 'z-index: ' + zIndex : ''}}"></view>
```

### AXML 不能使用 `{{{}}}` 方式传递对象，除 template 的 data 属性之外，也不能使用解构语法

- 问题表现：微信小程序中的 `{{{ }}}` 会报语法错误，也不能使用 `{{...data}}`
- 问题解决：在 js 文件中声明完整对象，然后再 axml 中直接传递，如 `{{data}}`

---

## SJS

### SJS 解决方案示例

`util.sjs`

```javascript
const isType = (data, type) => typeof data === type
const toLowerCase = (str) => (isType(str, 'string') ? str.toLowerCase() : '')
const toUpperCase = (str) => (isType(str, 'string') ? str.toUpperCase() : '')
const slice = (arr, start) => arr.slice(start)

export default {
  isType,
  toLowerCase,
  toUpperCase,
  slice
}
```

```diff
+ <import-sjs name="util" from="./util.sjs"/>

- <view>typeof展示：typeof 'string' {{typeof 'string' === 'string'}}</view>
+ <view>typeof展示：typeof 'string' {{util.isType('string', 'string')}}</view>

- <view>string的toLowerCase展示：STRING => {{'STRING'.toLowerCase()}}</view>
+ <view>string的toLowerCase展示：STRING => {{util.toLowerCase('STRING')}}</view>

- <view>string的toUpperCase展示：string => {{'string'.toUpperCase()}}</view>
+ <view>string的toUpperCase展示：string => {{util.toUpperCase('string')}}</view>

- <view>array的slice展示：[1,2,3] => {{[1,2,3].slice(1)}}</view>
+ <view>array的slice展示：[1,2,3] => {{util.slice([1,2,3], 1)}}</view>
```

### 不能使用 namedExport

- 问题表现：在微信小程序中，只支持`module.exports`而在支付宝中是除了`export default {}` 以外还支持了 `export const x = 1;` 然后在 xml 中通过`<import-sjs from="./namedExport.sjs" name="{x}" />`来引用。而这套机制在微信中无法抹平，而`export default`已经能够满足所有业务诉求。
- 解决方案：所有`sjs`中只采用`export default {}`

---

## 原生组件

### slider

- `track-size`属性在微信小程序下不能支持

​

​

### scroll-view 中 flex 布局失效

- 问题表现：在微信小程序中，sroll-view 使用 flex 布局会失效。
- 解决方案：
  - 方法一：在 scroll-view 内层再嵌套一层 view，对这个 view 使用 flex 布局；参考[https://segmentfault.com/q/1010000007532480](https://segmentfault.com/q/1010000007532480)
  - 方法二：使用 enable-flex 属性
- 问题示例 👇🏻

​

例如：
原始效果（横向布局）
![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/269922/1601632677440-9660077f-a4aa-46de-a533-2cfe56aab189.png#height=42&id=QErf3&margin=%5Bobject%20Object%5D&name=image.png&originHeight=86&originWidth=796&originalType=binary&ratio=1&size=14215&status=done&style=none&width=386)
迁移之后代码（纵向布局）
![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/269922/1601632746857-85c9c822-00c4-4d49-8812-471373aca2f1.png#height=269&id=s5fTv&margin=%5Bobject%20Object%5D&name=image.png&originHeight=662&originWidth=244&originalType=binary&ratio=1&size=22908&status=done&style=none&width=99)

---

## 配置相关

### 使用自定义顶部导航栏时

- 问题表现：在.json 文件中设置 `**"transparantTitle":"always"**` 时：
  - 微信端左上角的返回按钮和 home 按钮会无法显示，需要自定义
  - 支付宝仍可以获取到 **statusBarHeight **和 **titleBarHeight **的值，但微信获取到的 **titleBarHeight **值为零
- 解决方案：
  - 没有返回按钮的问题只能是前端手动添加
  - 微信侧可以通过 api：**wx.getMenuButtonBoundingClientRect() **获取到胶囊位置，手动计算出 title 部分高度，参考代码逻辑如下 👇🏻

```javascript
function getHeaderBar() {
  const systemInfo = getSystemInfoSync()
  if (systemInfo.app === 'wechat') {
    // 微信端
    // 低版本兼容，基础库 2.1.0 开始支持
    // eslint-disable-next-line no-undef
    if (wx.getMenuButtonBoundingClientRect) {
      // 该方法可使用
      // eslint-disable-next-line no-undef
      const { height, top, left } = wx.getMenuButtonBoundingClientRect()
      console.log('微信读取胶囊结果', { height, top, left })
      let { statusBarHeight } = systemInfo
      const extraHeight = 10
      statusBarHeight = top - statusBarHeight > 0 ? statusBarHeight : 0 // 华为p10状态栏是浮层
      const titleBarHeight = (top - statusBarHeight) * 2 + height + extraHeight
      return {
        height: statusBarHeight + titleBarHeight,
        titleBarHeight: titleBarHeight,
        statusBarHeight: statusBarHeight,
        buttonLeft: left,
        extraHeight
      }
    }
    // 低版本兼容
    return {
      height: 84,
      titleBarHeight: 40,
      statusBarHeight: 44
    }
  }

  // 非微信端
  const { titleBarHeight, statusBarHeight } = systemInfo
  return {
    height: titleBarHeight + statusBarHeight,
    titleBarHeight,
    statusBarHeight
  }
}
```

​
