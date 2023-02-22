# setData 实现原理

`setData` 需要做哪些事情？

1. 类似 `react` 的 `setState`，可以修改当前组件 `data` 中的数据。
2. 数据的修改是同步的，渲染是异步的。
3. 支持已 `path` 的形式来设置 `data` 中的数据。

在说 `setData` 实现方案之前，有必要提一下 `MorJS` 并没有使用 `react` 中 `setState` 方法，而是自身实现了一套类似 `setState` 的实现，然后通过调用 `forceUpdate` 方法来强制 `react` 组件重新渲染。

本来吧，`react` 的 `setState` 也能实现以上的功能，但是考虑到需要遵循小程序的框架设计原则，渲染和业务逻辑是分离的，可以简单的理解为是渲染和业务逻辑是两个不同的模块，处于不同的 `worker` 上。因此，`runtime` 在实现的过程中不能无脑直接使用 `react` 的所有方法。在实际的小程序中，渲染和业务逻辑是在不同的 `worker` 中，但是在 `MorJS` 中，无需照搬，只需要实现类似的功能即可。另外，在 `MorJS` 中，`Component` 方法传入的 `options` 内容和直接`react` 组件是不一样的，是两个不同的模块。甚至是渲染函数(`axml` 编译出来的 `render` )也是独立的。

在上一篇中提到，`Component` 和 `react` 组件 其实是互相循环交互的，但是 `setData` 只会在 `Component` 中触发。

![image](https://gw.alicdn.com/imgextra/i2/O1CN01O3F9xT1LBa8S1iS5i_!!6000000001261-2-tps-388-103.png)

下面直接上代码。

```js
const reactComponent; // react组件
function setData(obj, callback) {
   let hasUpdateData = false; // 是否有更新data中的数据
   Object.keys(obj).forEach(key => {
     // 这里做了简单的 相等 判断。 防止某些生命周期的死循环
     const newValue = get(obj, key);
     if (newValue !== undefined && !isEqual(newValue, get(this.data, key))) {
       hasUpdateData = true;
       set(this.data, key, newValue)
     }
   })
   if (hasUpdateData) { // false 的情况只有发生在，用户只是更新 props中的value
     reactComponent.forceUpdate(); // 触发 render
   }
   callback && setTimeout(callback); // 异步方式触发回调
 }
```

代码中用到了 `set` 和 `get` 方法，这两个方法都是 `lodash` 中的方法，之所以用这两个方法，是因为需要支持以路径的形式来设置 `data`，比如: `setData({ 'user.name':'name' })`。

另外，上面代码也做了简单的相等判断，这个功能可以简单理解为 `react` 中 `PureComponent` 提供的功能，可以防止在某些生命周期函数中调用 `setData` 从而引发死循环的问题。

当调用 `react` 组件的 `forceUpdate` 方法，就会触发 `react` 的 `render` 调用，这时候再调用上一篇内核篇中介绍的由编译器生成的 `render` 函数，就形成了一次完整的渲染流程。
