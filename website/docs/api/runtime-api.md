# Runtime API

## createApi(adapters, options)

初始化 MorJS API，默认会自动初始化一个全局的 mor api

- `adapters`: 初始化选项
  - `adapters[x].initApi`: 初始化接口方法, 接受 apiOptions 作为参数
- `options`: 初始化选项, 默认为 {}

```typescript
import { createApi } from '@morjs/api'

createApi([], {})
```

## mor(adapters, options)

初始化 mor 接口

## registerFactory(factoryName, factoryFunction)

注册接口初始化工厂函数

- `factoryName`: 接口初始化工厂函数名称
- `factoryFunction`: 接口初始化工厂函数

```typescript
import { registerFactory } from '@morjs/api'

registerFactory(factoryName, factoryFunction)
```

## init(options)

初始化一个新的 mor api 实例

- `options`: 选项

```typescript
import { init } from '@morjs/api'

init(options)
```

## Base64.encode(this, input)

对输入的值进行 encode 编码

- `this`: IBase64 对象本省
- `input`: 需要进行 encode 编码的字符串

```typescript
import { Base64 } from '@morjs/api'

Base64.encode(this, input)
```

## Base64.decode(this, input)

对输入的值进行 decode 解码

- `this`: IBase64 对象本省
- `input`: 需要进行 decode 解码的字符串

```typescript
import { Base64 } from '@morjs/api'

Base64.decode(this, input)
```

## Base64.utf8Encode(this, input)

对输入的值进行 utf8 格式的 encode 编码

- `this`: IBase64 对象本省
- `input`: 需要进行 utf8 格式的 encode 编码的字符串

```typescript
import { Base64 } from '@morjs/api'

Base64.utf8Encode(this, input)
```

## Base64.utf8Decode(this, input)

对输入的值进行 utf8 格式的 decode 解码

- `this`: IBase64 对象本省
- `input`: 需要进行 utf8 格式的 decode 解码的字符串

```typescript
import { Base64 } from '@morjs/api'

Base64.utf8Decode(this, input)
```

## getEnv()

获取小程序运行环境

```typescript
import { getEnv } from '@morjs/api'

const env = getEnv()
```

## getEnvDesc()

获取当前环境描述信息

```typescript
import { getEnvDesc } from '@morjs/api'

const envDesc = getEnvDesc()
```

## getGlobalObject()

获取全局对象，如支付宝的 my，微信的 wx

```typescript
import { getGlobalObject } from '@morjs/api'

const global = getGlobalObject()
```

## createEvent(reason, all)

创建 Emitter 实例

- `reason`: 事件创建原因, 用于统计
- `all`: 自定义 Map 用于存储事件名称和事件处理函数

```typescript
import { createEvent } from '@morjs/api'

createEvent(reason, all)
```

## getAllEvents()

获取所有 event 实例

```typescript
import { getAllEvents } from '@morjs/api'

getAllEvents()
```

## event

全局默认 Event

## createHooks(reason)

创建 hooks 对象

- `reason`: Hooks 创建原因

```typescript
import { createHooks } from '@morjs/api'

createHooks(reason)
```

## getAllHooks()

获取所有 hooks

```typescript
import { getAllHooks } from '@morjs/api'

getAllHooks()
```

## hooks

获取全局共享属性，用于作为原子化的兜底实现

## applyPlugins(hooks, plugins)

应用插件

- `hooks`: Hooks
- `plugins`: 插件列表

```typescript
import { applyPlugins } from '@morjs/api'

applyPlugins(hooks, plugins)
```

## applySolutions(hooks, solutions)

应用 Solutions

- `hooks`: Hooks
- `solutions`: 插件集列表

```typescript
import { applySolutions } from '@morjs/api'

applySolutions(hooks, solutions)
```

## logger.warn(msg)

在控制台打印 `warn` 类型的日志输出

- `msg`: 显示日志的输出内容

```typescript
import { logger } from '@morjs/api'

logger.warn(msg)
```

## logger.log(msg)

在控制台打印 `log` 类型的日志输出

- `msg`: 显示日志的输出内容

```typescript
import { logger } from '@morjs/api'

logger.log(msg)
```

## logger.error(msg)

在控制台打印 `error` 类型的日志输出

- `msg`: 显示日志的输出内容

```typescript
import { logger } from '@morjs/api'

logger.error(msg)
```

## logger.info(msg)

在控制台打印 `info` 类型的日志输出

- `msg`: 显示日志的输出内容

```typescript
import { logger } from '@morjs/api'

logger.info(msg)
```

## logger.debug(msg)

在控制台打印 `debug` 类型的日志输出

- `msg`: 显示日志的输出内容，仅在开启 debug 时显示

```typescript
import { logger } from '@morjs/api'

logger.debug(msg)
```

## logger.deprecated(msg)

在控制台打印一段 `warn` 类型的 deprecate 日志输出

```typescript
import { logger } from '@morjs/api'

logger.deprecated(msg)
```

## logger.time(label) & logger.timeEnd(label)

耗时性能日志输出, 需要 `logger.time()` 配合 `logger.timeEnd()` 一起使用

- `label`: 必填 `string` 类型，打印同一 `label` 值从开始到结束之间的耗时，单位 ms

```typescript
import { logger } from '@morjs/api'

logger.time(label)
logger.timeEnd(label)
```

## ModuleManager

模块管理，用于获取当前小程序中的插件、分包和模块等

## asArray(arr)

确保一个对象是数组

1. 如果 对象 == null 则返回空数组
2. 如果 对象不是数组 则返回包含该对象的数组
3. 如果 对象是数组 直接返回

- `arr`: 需要转换为数组的参数

```typescript
import { asArray } from '@morjs/api'

asArray(arr)
```

## compose(stack)

将多个函数合并为一个函数

- `stack`: 函数堆栈

```typescript
import { compose } from '@morjs/api'

compose(stack)
```

## generateId()

生成 ID

```typescript
import { generateId } from '@morjs/api'

generateId()
```

## getSharedProperty(propName, context)

获取全局共享属性，用于作为原子化的兜底实现

1. 首先查找上下文中对应的属性
2. 如果不存在，则查找 getApp 中的
3. 如果不存在，则查找 小程序环境的 globalObject, 如 my 中是否存在
4. 如果不存在，则使用 SHARED 作为兜底

- `propName`: 共享属性名称
- `context`: 当前执行环境的上下文

```typescript
import { getSharedProperty } from '@morjs/api'

getSharedProperty(propName, context)
```

## hasOwnProperty(obj, propertyName)

对象中是否包含对应的属性

- `obj`: 对象
- `propertyName`: 属性名称

```typescript
import { hasOwnProperty } from '@morjs/api'

hasOwnProperty(obj, propertyName)
```

## transformApis(mor, global, config, installAllGlobalApis, allowOverride)

接口抹平转换

- MorJS: mor 接口对象
- `global`: 小程序目标平台全局对象
- `config`: 接口抹平配置
- `installAllGlobalApis`: 是否在 mor 中添加所有的 API
- `allowOverride`: 是否允许覆盖 API

```typescript
import { transformApis } from '@morjs/api'

transformApis(mor, global, config, installAllGlobalApis, allowOverride)
```

## markAsUnsupport(apiName)

返回暂不支持的 函数

- `apiName`: 接口名称

```typescript
import { markAsUnsupport } from '@morjs/api'

markAsUnsupport(apiName)
```
