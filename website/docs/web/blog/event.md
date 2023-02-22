# 事件原理

小程序原生组件有些事件是支持路由的，比如：`tap、touchstart、touchmove、touchend` 等，这个其实跟 `HTML` 原生事件是一样的。如果仅仅是支持路由事件的话，直接使用`react` 事件(因为是运行在 `react` 上的)即可。但事实上，`react` 的事件支持是有限的，`react` 仅仅提供了一些常用的事件支持，但是对于自定义( `CustomEvent` )的路由事件是无法支持的。[`react` 事件支持列表](https://reactjs.org/docs/events.html) 。如果想要支持自定义事件，那么还得回到 `HtmlElement.addEventListner` 上来。因此，在 `MorJS` 的事件解决方案中，干脆剔除不再采用 `react` 事件，而是直接由 `runtime` 来提供事件的支持。

这就意味着，`runtime` 需要具备事件的注册、分发能力。首先，我们代码最终是被编译成 `react` 代码，而 `react` 不支持自定义事件，因此解决方案最终还是会回到 `addEventListener` 上来，然而，下一个问题是如何找到事件的绑定对象( `HTMLElement` )。如下例子：

```html
<view onTap="onTapEvent"> view </view>
```

`view` 是一个 `HTMLElement` ，需要绑定事件 `onTap` ，并且事件的回调方法需要绑定到 JS 文件中的 `onTapEvent` 方法。以上的代码如果转换成 `JSX` 代码的话如下：

```js
render(){
 return <view>view</view>
}
```

上面说了，`MorJS` 放弃了 `react` 自带的事件系统，还是回到 `addEventListener` 上来，因此需要在 `react` 组件渲染完( `componentDidMount` ) 以后，动态的找到对应的 `HtmlElement` 并且绑定事件。那么这时候问题就回到如果找到需要绑定事件的 `HtmlElement`。

平常我们在开发 `react` 的时候，会通过 `ref` 或者 `querySelectorAll` 、 `querySelector` 来查询 `HtmlElement` ，然而在 `MorJS` 中显然不会大规模的使用 `ref` 来获取，最简单的方法就是通过 `querySelectorAll` 来查询。`MorJS` 在编译器层面，对所有的元素都会设置一个 `tiga_node_id` 的属性，这个属性的作用就是 `xml` 文档(非 `dom` )中每个元素的 `id` 是唯一的。之所以会分配这个 `id`，主要是考虑了以后可以兼容 `domino` 平台，支持低代码平台的画布。

```js
render(){
  return <view tiga_node_id="e539a99b2f584b80a9af3293d1c6bfca">
    view
  </view>
}
```

那么可以使用

```js
querySelectorAll(`[tiga_node_id="e539a99b2f584b80a9af3293d1c6bfca"]`)
```

就能找到对应的 `htmlElement` 。那么剩下还有一个问题，就是如何建立绑定关系，不同的事件需要绑定不同的事件回调函数。这个时候就又得需要编译器来实现了，由编译器将绑定关系转换成对象，在元素被 `react` 解析的时候将绑定关系注册到组件中，具体编译结果如下：

```js
render(){
  return <view tiga_node_id="c3c646304e624433a1ea9e0b9a261d29">
    view
    {$rm.registEvents([{
      name: "tap",
      event: "onTapEvent",
      catch: false
    }], "c3c646304e624433a1ea9e0b9a261d29")}</view>
}
```

从上面代码可以看到，`AXML` 代码在编译有事件的的元素的时候会添加一个 调用 `$rm.registEvents` 方法的 `jsx` 表达式。`registEvents` 方法是 `runtime` 提供的，而这个方法所做的事情其实很简单，就是把事件绑定信息缓存起来。代码如下：

```js
registEvents(events, nodeId) {
  this.eventsInfo[nodeId] = events;
}
```

> 上面代码中的 `this` 指代的是组件、页面本身。而编译器编译后的代码，仅仅是一个 `render` 函数。

自此，事件绑定信息已经有了，那么就可以进行动态绑定了。

具体代码如下：

```js
/**
 * 动态绑定事件
 */
bindEvents() {
  const root = ReactDOM.findDOMNode(this);
  if (!root) return;
  for (const noedId in this.eventsInfo) {
    const events = this.eventsInfo[noedId];
    // 先通过 tiga_node_id 来找到对应的节点元素。
    const elments = root.querySelectorAll(`[tiga_node_id="${noedId}"]`);
    // 然后动态添加绑定。
    for (const el of elments) {
      for (const eventInfo of events) {
        el.addEventListener(eventInfo.name, this.raiseEvent)
      }
    }
  }
}

raiseEvent(e) {
    const currentTarget = e.currentTarget;
    // 根据nodeId找到对应的事件配置
    const nodeId = currentTarget.getAttribute('tiga_node_id');
    if (nodeId) {
      const events = this.eventsInfo[nodeId];
      if (events) {
        const eventInfo = events.filter(i => i.name == e.type).pop();
        // NOTE:catch 会阻止事件冒泡  https://opendocs.alipay.com/mini/framework/events#%E4%BA%8B%E4%BB%B6%E7%B1%BB%E5%9E%8B
        if (eventInfo.catch) {
          e.stopPropagation();
        }
        // 找到事件回调函数
        const func = this.componentConfig[eventInfo.event];
        func && func.call(this.componentConfig, eventConvert(e));
      }
    }
  }
```

`bindEvents` 方法在每次组件 `componentDidMount` 、 `componentDidUpdate` 两种生命周期函数中调用。

当事件触发的时候会调用 `raiseEvent` 方法，通过 `currentTarget` 的 `tiga_node_id` 属性找到事件绑定配置，进而找到事件回调函数。

以上就是事件完整的实现原理。

> 为了性能考虑，上面 `runtime` 代码中使用 `querySelectorAll` 的方式可以替换成 `getElementsByClassName` 。这个在下一版本优化中改进。

## dataset 原理

以上介绍了事件的实现原理，然而，实际上整个事件流程还包括 `dataset` 的设置以及读取。在小程序中，`dataset` 是支持 `string、array、object、number` 等数据类型的，但是 `tiga` 是基于 `web-components` 实现的，也可以理解为原生的 `html` 元素，然而 `html` 元素的 `dataset` 只支持 `string` ，这时候如果要支持其他类型，那么就需要进行一定的转换。

首先是编译器，针对 `data-` 开头的属性，进行转码。

例子如下：

```html
<view
  data-obj="{{ {name:'haiwei',age:20} }}"
  data-number="{{ 123 }}"
  data-array="{{ [1,2,3] }}"
>
  view
</view>
```

编译后的代码如下：

```js
render() {
  return <view data-obj={$rm.toDatasetString({
    name: 'haiwei',
    age: 20
  })} data-number={$rm.toDatasetString(123)} data-array={$rm.toDatasetString([1, 2, 3])}>
    view
  </view>;
}
```

`toDatasetString` 方法是由 `runtime` 提供的。将数据对象转换成字符串。具体实现方法如下：

```js
toDatasetString(value) {
  switch (typeof value) {
      case 'string': {
        return `$.value('${value}')`;
      }
      case 'object': {
        if (value === null) {
          return '$.nul()';
        }
        return `$.value(${JSON.stringify(value)})`
      }
      case 'function': {
        return '';
      }
      case 'undefined': {
        return '$.undefined()';
      }
      case 'bigint':
      case 'number':
      case 'boolean': {
        return `$.value(${value})`;
      }
      default: {
        return `$.value(${value})`;
      }
    }
}
```

从上面的代码可以看出， `toDatasetString` 方法的主要内容就是根据数据的类型，返回一段 `js` 表达式字符串。

最终渲染出的 `html` 代码如下:

```html
<view
  data-obj='$.value({"name":"haiwei","age":20})'
  data-number="$.value(123)"
  data-array="$.value([1,2,3])"
>
  view
</view>
```

因为，整个事件的触发是由 `runtime` 实现的，那么当然 `dataset` 也可以由 `runtime` 进行转换。比如当转换 `html` 元素的 `dataset` 时，代码如下：

```js
convertDataSet(dataset) {
  const ds = {};
  if (dataset) {
    //  这里的转换，主要是为了 dataset 支持对象或者数组
    Object.keys(dataset).forEach(key => {
      const value = dataset[key];
      ds[key] = parseDatasetValue(value);
    });
  }
  return ds;
}
```

而 `parseDatasetValue` 方法就是将上面转换后的 `js` 表达式字符串，转换成实际的数据类型。

```js
const DataSetParser = {
  nul() {
    return null
  },
  undefined() {
    return undefined
  },
  value(v) {
    return v
  }
}

/**
 * 解析dataset value
 * @param {*} str
 */
function parseDatasetValue(str) {
  const $ = DataSetParser
  return eval(str)
}
```

这里，最核心的就是 `eval` 方法的调用，直接执行上面转换后的 `js` 表达式得到正确的数据类型。
