---
title: 支付宝 DSL
---

# 开发一个 To-Do List (支付宝 DSL)

这篇文章将带领你使用 MorJS，开发一个简单的 To-Do List 小程序，并部署到不同的小程序平台。

## 成果展示

- 支付宝小程序
  <img src="https://img.alicdn.com/imgextra/i4/O1CN019WhvfV26YkDmGaClR_!!6000000007674-2-tps-2880-1800.png" />

- 微信小程序
  <img src="https://img.alicdn.com/imgextra/i2/O1CN01Up9NI81bbGJFnVk7q_!!6000000003483-2-tps-2880-1800.png" />

- 字节(抖音)小程序
  <img src="https://img.alicdn.com/imgextra/i2/O1CN01N6wbYC1gGicgOgPyf_!!6000000004115-2-tps-2880-1800.png" />

## 环境准备

首先需要有 node，并确保 node 版本为 14 或以上，该部分的内容在 [快速上手](/guides/introduction/getting-started) 中已经提到了，我们这里就不再赘述了。

使用 `node -v` 来查看当前 node 版本

```shell
$ myapp node -v
v14.19.3
```

待会儿我们需要部署到不同的小程序平台，所以需要对应小程序的 IDE 模拟器进行调试，以下是各小程序 IDE 下载地址，您只需要下载需要的平台的开发者工具即可，本文以支付宝开发者工具为例。

<img src="https://img.alicdn.com/imgextra/i3/O1CN01tLUqDR1i8apLwgcOx_!!6000000004368-0-tps-2000-1400.jpg" />

- [支付宝开发者工具](https://opendocs.alipay.com/mini/ide/download)
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- [抖音开发者工具](https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/developer-instrument/download/developer-instrument-update-and-download)
- [百度开发者工具](https://smartprogram.baidu.com/docs/develop/devtools/history/)
- [QQ 开发者工具](https://q.qq.com/wiki/tools/devtool/)
- [快手开发者工具](https://mp.kuaishou.com/docs/develop/developerTools/downloadPath.html)

## 配置小程序

打开项目根目录下的 mor.config.ts 文件，该文件是 mor 项目的主要配置文件，根据 [快速上手](/guides/introduction/getting-started) 初始化生成的配置有两份：

1. 其中 `target` 值为 `alipay` 的，代表我们编译目标是支付宝小程序，这一份配置默认名称为 `alipay-miniprogram`
2. 第二份 `target` 值为 `wechat` 的，代表我们编译目标是微信小程序，这一份配置默认名称为 `wechat-miniprogram`

```typescript
import { defineConfig } from '@morjs/cli'

export default defineConfig([
  {
    name: 'alipay-miniprogram',
    sourceType: 'wechat',
    target: 'alipay',
    compileType: 'miniprogram',
    compileMode: 'bundle'
  },
  {
    name: 'wechat-miniprogram',
    sourceType: 'wechat',
    target: 'wechat',
    compileType: 'miniprogram',
    compileMode: 'bundle'
  }
])
```

接下来我们添加一份字节(抖音)小程序的配置：

1. 首先明确我们编译目标为字节小程序，需要把 `target` 值设置为 `bytedance`
2. 然后再给这份配置起一个名字，就叫 `douyin` ，把 `name` 设置为 `douyin`
3. 其他的配置就先复制一份，更多具体配置项可查阅 [MorJS 基础 - 配置](/guides/basic/config)

```typescript
import { defineConfig } from '@morjs/cli'

export default defineConfig([
  ...
  {
    name: 'douyin', // 配置名称
    sourceType: 'alipay', // 源码 DSL 类型
    target: 'bytedance', // 编译目标平台
    compileType: 'miniprogram', // 编译类型
    compileMode: 'bundle', // 编译模式
  }
]
```

如果你 `npm run dev` 命令行没有关闭的话，你会发现 `dist/` 下多出来一份 `dist/bytedance` 的文件，恭喜你完成了字节(抖音)端的小程序编译构建，这就是用于抖音端的开发产物啦~ 🎉 🎉 🎉

## 实作页面组件

接下来我们将对目前的初始化项目添加页面和组件。如你所见，初始化后的页面已经具备了显示 Tode List 和添加 Todo 功能，下面我们使用添加页面来实现编辑 Todo 功能，使用添加组件来实现删除 Todo 功能。

### 添加页面

#### 页面配置

1. 在 `src/pages` 下创建文件夹 `src/pages/edits-todo` 用于存放编辑 Todo 功能相关的页面
2. 在该文件夹下创建小程序页面的四个基础文件 `edits-todo.axml` `edits-todo.less` `edits-todo.ts` `edits-todo.json`
3. 打开 `edits-todo.json` 文件进行编译，先写一个 `{}` 作为空配置
4. 在页面配置 `src/app.json` 中添加该页面到 `pages` 中

```json
{
  "pages": [
    "pages/todos/todos",
    "pages/add-todo/add-todo",
    "pages/edit-todo/edit-todo"
  ]
}
```

> 1. 关于 `xml` 文件，若项目初始化时选择的是微信 DSL，页面的基础文件可改为 `edits-todo.wxml`
> 2. 关于 `css` 文件，MorJS 支持 wxss/acss/less/scss 文件类型，开发者可选择适合的文件格式进行编写

#### 页面功能

1. 编辑入口：首页 `src/pages/todos` 需要添加一下编辑的入口，修改一下首页的样式，js 中需要增加点击跳转方法，并把该项的 index 传给页面，用于标记哪一项的内容需要被编辑。

```xml
<!-- src/pages/todos/todos.axml -->
<label a:for="{{todos}}" a:for-item="item" class="todo-item {{item.completed ? 'checked' : ''}}" a:key="{{index}}">
  ...
  <view class="todo-item-edit" onTap="editTodo" data-index="{{index}}">编辑</view>
</label>
```

```typescript
// src/pages/todos/todos.ts
import { aApp } from '@morjs/core'

aPage({
  ...,
  editTodo(e) {
    my.navigateTo({url: `../edit-todo/edit-todo?index=${e.target.targetDataset.index}`})
  },
})
```

```css
/* src/pages/todos/todos.less */
.todo-items {
  padding: 50rpx 30rpx;
}
.todo-item {
  display: flex;
  align-items: center;
}
.todo-item-text {
  width: 360rpx;
}
.todo-item-edit {
  margin: 0 20rpx;
}
```

2. 编辑功能：

- xml 文件中需要一个 input 用于显示和修改被编辑项的内容和一个按钮用于触发完成编辑
- css 文件编辑页面样式
- js 文件中，对页面传入的 index 对应的内容进行保存，提供给 xml 中的 input 显示，并添加一个方法用于按钮点击后触发

```xml
<!-- src/pages/todos/edit-todos.axml -->
<view class="page-edit-todo">
  <view class="edit-todo">
    <input class="edit-todo-input" placeholder="What needs to be done?" onBlur="onBlur" value="{{inputValue}}" />
  </view>
  <view class="todo-footer">
    <add-button text="Edit Todo" onClickMe="edit"></add-button>
  </view>
</view>
```

```typescript
// src/pages/todos/edit-todos.ts
import { aPage } from '@morjs/core'

const app = getApp()

aPage({
  onLoad(query: any): void {
    this.setData({
      index: query.index,
      inputValue: app.todos[query.index].text
    })
  },

  data: {
    index: '',
    inputValue: ''
  },

  onBlur(e: any) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  edit() {
    const { index, inputValue } = this.data
    app.todos[index].text = inputValue
    my.navigateBack()
  }
})
```

```css
/* src/pages/todos/edit-todos.less */
.page-edit-todo {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.edit-todo {
  padding: 40px;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.edit-todo-input {
  display: block;
  font-size: 50rpx;
  font-weight: 100;
  padding: 5px 5px;
  background: none;
  border: none;
  border-bottom: 1px solid #dfdfdf;
  color: #0effd6;
  width: 100%;
}

.todo-footer {
  padding: 50rpx 0 100rpx;
  font-size: 48rpx;
  font-weight: 200;
  text-align: center;
}
```

```json
// src/pages/todos/edit-todos.json
{
  "usingComponents": {
    "add-button": "/components/add-button/add-button"
  }
}
```

3. 通过上述流程后，我们在 todo list 的每一项后面都会有一个「编辑」按钮，点击将会调转到编辑页，修改完内容后点击编辑页下方的按钮即可报错并回到 todo list 页，以上，恭喜你学会了怎么添加和编辑页面代码！🎉 🎉 🎉

### 添加组件

#### 组件配置

1. 在 `src/components` 下创建文件夹 `delete-check` 用于存放删除 Todo 功能相关的组件
2. 在该文件夹下创建小程序组件的四个基础文件 `delete-check.axml` `delete-check.less` `delete-check.ts` `delete-check.json`
3. 在需要使用到该组件的页面 `todos.json` 中配置引入该组件

```json
// src/pages/todos/todos.json
{
  "usingComponents": {
    "add-button": "../../components/add-button/add-button",
    "delete-check": "../../components/delete-check/delete-check"
  }
}
```

4. 在需要使用到该组件的页面 `todos.axml` 中使用引入的组件

```xml
<!-- src/pages/todos/todos.axml -->
<view class="page-todos">
  ...
  <!-- 删除确认弹窗 -->
  <delete-check a:if="{{showDeleteCheck}}" checkIndex="{{checkIndex}}" onCancelDel="onCancelDel" />
</view>
```

#### 组件功能

1. 删除入口：首页 `src/pages/todos` 需要添加一下删除的触发入口，修改一下首页的样式，js 中需要增加点击删除方法，并把该项的 index 传给组件，用于标记哪一项的内容需要被删除，同时添加一个方法 onCancelDel 用于设置 showDeleteCheck 为 false 关闭删除确认框。

```xml
<!-- src/pages/todos/todos.axml -->
<label a:for="{{todos}}" a:for-item="item" class="todo-item {{item.completed ? 'checked' : ''}}" a:key="{{index}}">
  ...
  <view class="todo-item-del" onTap="delTodo" data-index="{{index}}">删除</view>
</label>
```

```typescript
// src/pages/todos/todos.ts
aPage({
  data: {
    checkIndex: '',
    showDeleteCheck: false
  },
  // 打开删除框
  delTodo(e) {
    const index = e.target?.targetDataset?.index || e.target?.dataset?.index
    this.setData({
      checkIndex: index,
      showDeleteCheck: true
    })
  },
  // 关闭删除框
  onCancelDel(e) {
    this.setData({
      todos: app.todos,
      checkIndex: '',
      showDeleteCheck: false
    })
  }
})
```

```css
/* src/pages/todos/todos.less */
.todo-item-del {
  margin: 0 20rpx;
  color: crimson;
}
```

2. 删除功能：

- xml 文件用于显示弹窗的浮层，其中一个确认删除按钮用于触发删除，一个取消按钮用于关闭弹窗
- css 文件编辑页面样式
- js 文件中，对页面传入的 index 对应的内容进行保存，提供给 xml 中显示，并添加一个删除方法和一个关闭弹窗方法提供给 xml 点击触发

```xml
<!-- src/components/delete-check/delete-check.axml -->
<view class="delete-check-bg">
  <view class="delete-check">
    <view class="delete-check__text">确认删除「{{text}}」</view>
    <view class="delete-check__btn-box">
      <view class="btn-del" onTap="del">删除</view>
      <view class="btn-cancel" onTap="cancel">取消</view>
    </view>
  </view>
</view>
```

```typescript
// src/components/delete-check/delete-check.ts
import { aComponent } from '@morjs/core'

// 获取全局 app 实例
const app = getApp()

aComponent({
  props: {
    checkIndex: '',
    onCancelDel: () => {}
  },
  data: {
    text: ''
  },
  didMount() {
    const text = app.todos[this.props.checkIndex].text
    this.setData({ text })
  },
  methods: {
    del() {
      app.todos.splice(this.props.checkIndex, 1)
      this.cancel()
    },
    cancel() {
      this.props.onCancelDel()
    }
  }
})
```

```css
/* src/components/delete-check/delete-check.less */
.delete-check-bg {
  width: 100vw;
  height: 100vh;
  background-color: rgba(#fff, 0.6);
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  .delete-check {
    width: 400rpx;
    border: 1rpx solid #ccc;
    background: #fff;
    border-radius: 8rpx;
  }
  .delete-check__text {
    padding: 50rpx 30rpx;
    text-align: center;
  }
  .delete-check__btn-box {
    display: flex;
    align-items: center;
    .btn-del {
      width: 50%;
      text-align: center;
      color: crimson;
      padding: 20rpx;
      border: 1rpx solid #ccc;
      border-right: none;
    }
    .btn-cancel {
      width: 50%;
      text-align: center;
      padding: 20rpx;
      border: 1rpx solid #ccc;
    }
  }
}
```

```json
// src/components/delete-check/delete-check.json
{
  "component": true
}
```

3. 通过上述流程后，我们在 todo list 的每一项后面都会有一个「删除」按钮，点击将会打开删除弹窗，点击删除后即可删除该项，以上，恭喜你学会了怎么添加和编辑组件代码！🎉 🎉 🎉

## 多端部署

之前我们通过 `npm run dev` 命令行开启了多端的编译及监听，若是改为 `npm run dev:wechat` 则是只开启对于微信端的编译及监听，从 package.json 中配置不难发现，其区别在于命令行多了一个 `--name wechat` 的配置，通过 [MorJS 基础 - 命令行](/guides/basic/cli) 可以查到 `--name` 用于指定配置名称，也就是我们配置文件 `mor.config.ts` 中的配置 name。

通过 `npm run compile:prod` 命令行可对源码进行多端打包编译，不同于 dev 的是开启了生产模式编译构建，开启生产模式后会自动开启压缩支持，增加代码维度 context 条件编译、关闭 mock 等默认行为，同样若是改为 `npm run compile:prod:wechat` 则是只开启对于微信端的生产构建编译。

默认产物目录 `dist` 下则是多端编译的产物结果，对输出产物目录进行修改有两种方式：

1. `mor.config.ts` 配置修改，通过 [MorJS 基础 - 配置](/guides/basic/config#outputpath---%E8%BE%93%E5%87%BA%E4%BA%A7%E7%89%A9%E7%9B%AE%E5%BD%95) 可以查到配置 outputPath 可以修改输出产物目录。
2. 命令行 `--output-path` 配置，通过 [MorJS 基础 - 命令行](/guides/basic/cli) 可以查到 `--output-path` 用于修改输出产物目录，优先级比 `mor.config.ts` 配置。
