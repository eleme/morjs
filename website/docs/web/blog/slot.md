# Slot 实现原理

## slot

先上代码：(组件定义)

```html
<view>
  <!-- 匿名 slot-->
  <slot />

  <!-- 具名 slot-->
  <slot name="footer" />
</view>
```

编译后的代码：

```js
function defaultRender($data) {
  const { $children } = $data
  return (
    <view>
      <$rm.Slot slots={$children} />

      <$rm.Slot slots={$children} name="footer" />
    </view>
  )
}
```

> slot 会被编译成由 runtime 提供的 slot react 组件。并且将当前组件的 children 传过去。

使用组件:

```html
<custom-comp>
  <view> defualt </view>
  <view slot="footer"> footer </view>
</custom-comp>
```

编译后代码：

```js
function defaultRender($data) {
  return (
    <custom-comp>
      <view>defualt</view>

      <view _slot="footer">footer</view>
    </custom-comp>
  )
}
```

上面编译后的代码可以看出，对于适用方来说，编译器并没有做过多的处理。仅仅是将会 `slot` 属性改成 `_slot`，之所以这样，是因为 `html` 元素本来就有 `slot` 属性，为了确保不冲突，因此重名了属性名。

`slot` 不管是组件定义还是适用方，在编译器中并没有太多的转换。实际上，`MorJS` 中 `slot` 的实现就是通过 `react` 组件实现的。`runtime` 中的 slot 组件代码如下：

```js
export class Slot extends React.PureComponent {
  render() {
    const { name, slots } = this.props
    if (!slots) {
      return this.props.children || false
    }
    const findSlots = []
    // NOTE：之所以递归降维到一维数组，是因为有可能slots本身就是一个数组。
    flattendeep([slots]).forEach((s) => {
      try {
        if (s.props._slot === name) {
          //具名插槽
          findSlots.push(s)
        }
      } catch (e) {
        // 之所以会出现crash的情况，这里为了简化实现方案。比如string、number这些值类型数据，是没有props属性的。
        if (!name)
          // 只有在默认插槽下面才会显示
          findSlots.push(s)
      }
    })
    if (findSlots.length === 0) return this.props.children || false // 直接将slot组件包含的子组件渲染出来
    if (findSlots.length === 1) return findSlots[0]
    return findSlots
  }
}
```

直接读取子组件的 `_slot` 属性，跟当前 `slot` 组件的 `name` 来匹配。

这里分两种情况:

1. 如果当前 `slot` 是匿名 slot，那么如果 `_slot` 没有设置属性，也就是两者都是 `undefined` 那么匹配成功。
2. 如果当前 `slot` 是具名 `slot` ，那么只有 `_slot` 属性 `value` 跟 `name` 完全一致的情况下才会被匹配。

将匹配到的组件直接由 `slot` 渲染出来。

另外，也可以分析出，如果 `slot` 组件没有匹配到任何的子组件，那么直接将 `slot` 组件包含的子组件渲染出来。

## slot-scope

其实 `slot-scope` 功能才是最复杂的方案。这个功能感觉有点违反了数据单向传输的原则，子元素可以直接访问父组件的数据，打破了 `react` 中由 `setState` 维持的单向数据流的壁垒。如果单靠 `runtime` 的话是无法实现的。

老规矩，直接上示例代码：

组件定义代码：

```html
<!-- 自定义组件中的 -->
<view>
  <slot x="{{x}}" name="footer"> default value </slot>
</view>
```

编译后的代码：

```js
function defaultRender($data) {
  const { x, $children } = $data
  return (
    <view>
      <$rm.Slot x={x} slots={$children} name="footer" $scopeKeys={['x']}>
        default value
      </$rm.Slot>
    </view>
  )
}
```

这里相对于上面的普通 `slot` 实现，仅仅多了一个 `$scopeKeys` 属性，这个属性的作用仅仅是收集当前 `slot` 组件中用户定义的需要向外暴露的 `key`。

使用组件：

```html
<my-component>
  <view slot-scope="props" slot="footer"> component data: {{props.x}} </view>
</my-component>
```

编译后的代码：

```js
function defaultRender($data) {
  const { props } = $data
  return (
    <my-component>
      {function footer(props) {
        return <view>{'component data: ' + $rm.getString(props.x)}</view>
      }}
    </my-component>
  )
}
```

这里可以看出:

1. `slot-scope` 直接被编译成一个 `function`。
2. 这个 `function` 的入参就是 `slot-scope` 属性中定义的参数名称。
3. 这个 `function` 的名称就是 `slot` 属性中设置的名称。这里就是 `“footer”`。
4. 这个 `function` 其实也是一个简单的渲染函数。

这里有意思的是，你可以发现，参数名 `props` 也被变量提取了。你会发现，有两个地方定义了 `props` 变量，一个是渲染函数的最开始，另外一个是 `slot-scope` 编译后的`function` 的入参。由于变量优先级的存在，`function` 的入参的变量名大于渲染函数最开始的变量名，因此不会出现变量污染的情况。

除了编译后的代码有不同之外，`runtime` 中的 `slot` 组件也需要更新，需要识别 `function` ，修改的 `slot` 组件代码如下：

```jsx | pure
export class Slot extends React.PureComponent {
  render() {
    const { name, slots } = this.props
    if (!slots) {
      return this.props.children || false
    }
    const findSlots = []
    // NOTE：之所以递归降维到一维数组，是因为有可能slots本身就是一个数组。
    flattendeep([slots]).forEach((s) => {
      if (typeof s === 'function') {
        // slot是function，那么目前只有一种可能，那就是slot-scope
        if (s.name === name || (!name && !s.name)) {
          // 具名插槽或者是默认插槽
          // 合成数据对象。
          const $scopeKeys = this.props.$scopeKeys
          const args = {}
          if ($scopeKeys && $scopeKeys.length > 0) {
            $scopeKeys.forEach((key) => (args[key] = this.props[key]))
          }
          // slot-scope
          // 直接调用函数，并且将数据传入。
          findSlots.push(s(args))
        }
      } else {
        try {
          if (s.props._slot === name) {
            //具名插槽
            findSlots.push(s)
          }
        } catch (e) {
          // 之所以会出现crash的情况，这里为了简化实现方案。比如string、number这些值类型数据，是没有props属性的。
          if (!name)
            // 只有在默认插槽下面才会显示
            findSlots.push(s)
        }
      }
    })
    if (findSlots.length === 0) return this.props.children || false
    if (findSlots.length === 1) return findSlots[0]
    return findSlots
  }
}
```

1. 判断传入的子组件是否是 `function`
2. 判断是否匹配 `slot` 中的 `name`
3. 通过 `$scopeKeys` 动态创建一个 `data`，用来传给 `function`
4. 调用 `function` 获取 `react` 组件
