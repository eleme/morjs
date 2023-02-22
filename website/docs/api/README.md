# API 介绍

MorJS 提供了大量 API 给 <b>编译时</b> 和 <b>运行时</b> 使用，共分为 <b>工程 API</b> 和 <b>运行时 API</b> 两类

## 工程 API

提供给编译流程及命令行使用，包括以下三类:

- `Hooks`: mor 和 takin 对外暴露的 hook，提供给工程插件使用，下面以 `modifyUserConfig` 示例

```typescript
import type { Plugin, Runner } from '@morjs/cli'

export default class MorJSPluginXXX implements Plugin {
  name = 'MorJSPluginXXX'

  apply(runner: Runner) {
    // modifyUserConfig: 可基于命令行选项修改用户配置
    runner.hooks.modifyUserConfig.tap(this.name, (userConfig, command) => {
      const { outputPath } = command.options
      // 获取命令行 outputPath 选项，若有则修改 userConfig 的 outputPath 配置为该值
      if (outputPath) userConfig.outputPath = outputPath
      return userConfig
    })
  }
}
```

- `Takin API`: 由 takin 提供的 api，下面以 `logger.info` 示例

```typescript
import { logger } from '@morjs/cli'

logger.info('info 日志输出')
```

- `MorJS API`: mor 的 utils 对外开放的 api，下面以 `hexToRgb` 示例

```typescript
import { hexToRgb } from '@morjs/cli'

const colorRGB = hexToRgb('#FFFFFF')
```

## 运行时 API

提供给运行时流程使用，包括以下三类:

- `Runtime Core`: mor 的 api 对外开放的 api，下面以 `aApp` 示例

```typescript
import { aApp } from '@morjs/core'

aApp({
  onLaunch() {
    console.log('app onlaunch')
  }
})
```

- `Runtime Hooks`: mor 运行时对应小程序的 hook，提供给运行时插件使用，下面以 `appOnShow` 示例

```typescript
import type { MorJSHooks, MorJSPlugin } from '@morjs/api'

export default class RuntimePluginXXX implements MorJSPlugin {
  pluginName = 'RuntimePluginXXX'

  apply = (morHooks: MorJSHooks): void => {
    // appOnShow: 在 App 的 onShow 生命周期触发
    morHooks.appOnShow.tap(this.pluginName, function (this, options) {
      console.log('触发小程序 appOnShow 生命周期')
    })
  }
}
```

- `Runtime API`: mor 的 core 对外开放的 api，下面以 `getGlobalObject` 示例

```typescript
import { getGlobalObject } from '@morjs/api'

const global = getGlobalObject()
console.log(global) // my（支付宝）| wx（微信）
```
