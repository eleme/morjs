# 模版编译原理

在 `runtime` 中已经介绍过，`axml` 文件最终会被编译成 `render` 函数，如果除开 `js` 文件，那么 `axml` 文件其实可以直接当做模板文件使用。但是在小程序中， `template` 有自己的规范，模板内容的定义必须要被包含在 `template` 标签内，并且设置 `name` 属性，作为模板名称。

在 `runtime` 中有介绍，组件被编译成渲染函数，那么对于模板，一个模板编译成一个渲染函数不就可以了吗，只不过接受的数据域不同而已。

在介绍实现方案之前，先看下模板的功能。

1. 在 `template` 标签中定义模板内容，并且使用 `name` 属性来确定模板名称。
2. 通过 `template` 的 `is` 属性来使用模板，并且可以通过 `data` 属性传入数据。
3. 模板文件可以被引入到其他的 `axml` 文件中。事实上，任何 `axml` 文件中定义的 模板都可以被其他 `axml` 文件引入。
4. 模板支持嵌套，也就是说在定义的模板内容中，也可以使用其他的模板。

通过以上对模板功能的大概描述，可以基本确定，每个模板对应一个渲染函数，使用模板，其实就是调用渲染函数，并且使用 `data` 作为模板的渲染数据域。

而在 `MorJS` 的实现方案中，由 `runtime` 提供了一个专门的模板管理器，每个 `axml` 文件都会有一个模板管理器，当前 `axml` 文件中定义、引入的模板都会被注册到模板管理器中。下面通过实际的代码作为例子。

axml 代码：

```html
<!-- 定义模板 -->
<template name="t1">
  <view onTap="tapName">{{ text }}</view>
</template>

<!-- 引用其他axml文件中定义的模板 -->
<import src="./template.axml" />

<!-- 使用模板 -->
<template is="t1" data="{{ {text:'hello world'} }}" />
```

编译后的代码如下：

```js
import React from 'react'
import $rm from '@morjs/runtime-web/lib/runtime'

export const $templates = {}

//创建模板管理器
const $tm = $rm.createTemplateManager()

//创建模板:templatet1
function templatet1($data) {
  const { text } = $data
  return (
    <view onTap={$rm.getEvent('tapName', $data)}>{$rm.getString(text)}</view>
  )
}

$templates['templatet1'] = templatet1
//将当前文件定义的模板加入模板管理器
$tm.addAll($templates)
//引入其他文件的模板：./template.axml
$tm.addAll(require('./template.axml').$templates)

//添加渲染函数
export function defaultRender($data) {
  return $tm.renderTemplate(
    't1',
    {
      text: 'hello world'
    },
    $data.$reactComp
  )
}
```

从上面的代码中可以看到:

1. 定义了一个变量 `$templates` 用来缓存模板，并且这个变量会被导出。
2. 通过 `runtime` 提供的 `createTemplateManager` 方法创建了一个模板管理器。
3. 每个模板都会被编译成一个渲染函数，并且渲染函数的名字以一定的规则命名。
4. 模板渲染函数会被缓存到 变量 `$templates` 中。
5. 所有缓存到 `$templates` 中的模板渲染函数，同时也会被添加到模板管理器中。
6. 将其他文件中定义的模板添加到当前 `axml` 文件的模板管理器中。--注意引用的是 `$templates` 变量。
7. 在使用模板的地方，使用 `runtime` 提供的 `renderTemplate` 函数调用模板渲染函数。

对于第七点，之所以没有直接调用模板渲染函数，而是通过 `runtime` 的 `renderTemplate` 函数来调用，是因为，模板并不一定定义在当前文件中，而是可能会被定义在不同的文件中，以引入的方式引入到当前文件。就像第六点提到的，其他文件定义的模板只会添加到当前文件的模板管理器中，但不会被导出。也就是说明了，当前文件引用的其他文件的模板，不会被导出，会被隔离。

> `defaultRender` 是当前组件、页面的渲染函数。

在说说 `runtime` 提供的模板相关的方法到底做了什么,也就是模板管理器做了什么。

```js
// 对模板名称进行编码
// NOTE: 这里的代码必须跟 runtime 中的代码是一致的
function hashTemplateName(name) {
  return name
    .split('')
    .map((c) => (HashChars.indexOf(c) >= 0 ? c : '$'))
    .join('')
}

export default class TemplateManager {
  constructor() {
    this.templates = {}
  }
  addAll(obj) {
    Object.keys(obj).forEach((key) => {
      if (key.startsWith('template')) {
        this.templates[key] = obj[key]
      }
    })
  }

  renderTemplate(name, data, superComponent) {
    if (!name) {
      throw new Error('name 不能为空')
    }
    if (typeof name !== 'string') {
      throw new Error('name 必须是字符串')
    }
    if (data && typeof data !== 'object') {
      throw new Error('data 必须是对象. template name=' + name)
    }
    const t = this.templates[`template${hashTemplateName(name)}`]
    if (t) {
      const d = data || {}
      // 合并父级组件。以便后续递归传递数据
      if (!d['$reactComp'] && superComponent) {
        d['$reactComp'] = superComponent
        d['$root'] = superComponent.componentConfig // Component
        d['$compId'] = superComponent.$id
      }
      return t.call(d['$root'], d)
    } else {
      console.warn('模板不存在:' + name)
    }
    return null
  }
}
```

从上面的代码分析，最核心的还是 `renderTemplate` 方法，这个方法其实最重要的工作就是动态创建渲染函数需要的 `data`，也就是上面代码中的变量 `d` 。

在小程序中，模板是支持嵌套的，但是对于一个组件、页面来说，不管当前组件、页面用到了多少个模板，容器组件只有一个，就是当前的组件、页面。因此上面代码中的 `superComponent` 参数，其实就是当前组件、页面的引用，而且也会作为参数传递给模板，以便模板在嵌套的情况下传递给其他的模板。

综上：严格来说，模板和组件、页面的唯一不同点就是数据域的不一样，其他的其实都差不多。
