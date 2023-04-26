# FAQ

### 怎么编译成微信或抖音小程序

以编译成微信小程序为例：

1. 首先明确我们编译目标为微信小程序，需要在 `mor.config.ts` 配置中添加编译为微信的配置，其中 `target` 值设置为 `wechat`（配置参考 [MorJS 基础 - 配置 - target - 编译目标平台](/guides/basic/config#target---编译目标平台)）
2. 给这份配置起一个配置名字，把 `name` 设置为配置名称（如：`wechat`），其他配置可与基础配置相同保持不变
3. 在 `package.json` 的 `script` 中添加编译为微信的命令 `"dev:wechat": "mor compile -w --name wechat"`
4. 终端运行 `npm run dev:wechat`，产物 `dist/wechat` 即为编译成微信的产物，用微信 IDE 打开即可

> 更多具体配置项可查阅 [MorJS 基础 - 配置](/guides/basic/config)

```typescript
// mor.config.ts
import { defineConfig } from '@morjs/cli'

export default defineConfig([
  ...
  {
    name: 'wechat', // 配置名称
    sourceType: 'alipay', // 源码 DSL 类型
    target: 'wechat', // 编译目标平台
    compileType: 'miniprogram', // 编译类型
    compileMode: 'bundle', // 编译模式
  }
]
```

### 怎么指定产物的路径

默认产物目录 `dist` 下是编译的产物结果，对输出产物目录进行修改有两种方式：

1. `mor.config.ts` 配置修改，通过 [MorJS 基础 - 配置](/guides/basic/config#outputpath---%E8%BE%93%E5%87%BA%E4%BA%A7%E7%89%A9%E7%9B%AE%E5%BD%95) 可以查到配置项 outputPath 对此进行设置，修改输出产物目录。
2. 命令行 `--output-path` 配置，通过 [MorJS 基础 - 命令行](/guides/basic/cli) 可以查到 `--output-path` 用于修改输出产物目录，优先级比 `mor.config.ts` 配置。

方案一：

```typescript
// mor.config.ts
export default defineConfig([
  ...
  {
    name: 'wechat',
    ...,
    outputPath: 'build/wechat', // 产物路径
  }
]
```

方案二：

```bash
$ mor compile --name wechat --output-path build/wechat
```

### 未被使用的文件会被编译到产物里吗？

不会，但如果你想把某些未被使用的文件放到产物里，可以在 `mor.config.ts` 配置中，通过 [MorJS 基础 - 配置](guides/basic/config#copy---文件拷贝) 配置项 copy，设置要复制到输出目录的文件或文件夹；

```typescript
// mor.config.ts
export default defineConfig([
  ...
  {
    name: 'wechat',
    ...,
    copy: [
      { from: 'anotherFile.json', to: './' }
    ]
  }
]
```

### 小程序可以转换为小程序插件或分包吗？

可以，MorJS 小程序形态一体化支持小程序、小程序插件、小程序分包之间的互相转换，相关文档请查阅 [MorJS 进阶 - 小程序形态一体化](/guides/advance/unity-of-forms)

### 可以接入第三方的 UI 框架吗，接入的组件会一同转端吗？

可以，理论上（微信/支付宝）小程序原生的组件库是可以一并转换的，使用方式上，需按照对应平台的 npm 组件的规范来使用，无其他特别的要求。使用方法如下：

> 注意：我们内部并没有使用任何社区的组件库，各第三方 UI 框架表现不同，相关的兼容性需要具体进一步验证

1. 安装需要接入的第三方 UI 框架，具体方式请参照各 UI 框架的文档
2. 在配置文件 `mor.config.ts` 中添加对 `node_modules` 的处理，具体配置项 `processNodeModules`，相关文档请查阅 [MorJS 基础用法 - 配置 processNodeModules](/guides/basic/config/#processnodemodules---%E6%98%AF%E5%90%A6%E5%A4%84%E7%90%86-node_modules)

```typescript
// mor.config.ts
export default defineConfig([
  ...
  {
    name: 'alipay', // 配置名称
    ...,
    processNodeModules: {
      // 只有 npm 名称包含 @abc/alsc- 的 npm 才会被处理
      include: [/@abc\/alsc\-/]
    }
  }
]
```

3. 在项目中按 [照组件库规范](/specifications/component) 来引用组件，或按照实际路径引用组件，比如："@vant/weapp/popup/index" 或 "@vant/weapp/lib/popup/index"

```json
{
  "usingComponents": {
    "van-button": "@vant/weapp/button/index", // 引用 @vant/weapp 的 button 组件
    "van-popup": "@vant/weapp/lib/popup/index" // 引用 @vant/weapp 的 popup 组件
  }
}
```

4. 执行编译命令，用对应平台 IDE 打开对应产物即可

### 运行时提供的 hooks 的执行顺序是在页面原始方法前还是后？

目前运行时的 hooks 都是在原始方法之前执行
