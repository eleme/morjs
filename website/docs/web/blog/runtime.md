# 运行时原理

> 不管是 Page 还是 Component，在 MorJS 中，都会被视作组件处理。

![image](https://gw.alicdn.com/imgextra/i3/O1CN01X3oAYS1XtnslZt9a3_!!6000000002982-2-tps-1504-888.png)

上图是一个小程序组件不同代码文件最终被合并成一个组件的大概流程。从上图中可以看到，`acss` 文件、`axml` 文件在编译的时候就会被编译成 `react render function` ，而且是最终的渲染函数。这个函数只接受一个参数(`render-data`),根据 `data` 渲染出 `html`，没有任何其他的功能。

而 `Component(options)` -(其实就是 `js` 文件)会被编译器以模块的形式导出，在 `runtime` 中会根据 `options` 动态生成一个 `Component` 的实例(非 `react` 组件)，这个实例就是小程序中可以通过 `this` 访问的实例。

而上图中提到的 `React` 基础组件 可以这么理解，每个小程序组件的实例(`Component`)都会对应一个 `React` 基础组件，这个 `React` 组件负责管理生命周期函数的调用，并且负责渲染，同时也负责事件的交互回调。

每当 `setData` 被触发的时候其实是在 `Component` 中触发的，然后 `Component` 会调用 `react` 组件的 `render` 函数，进一步调用到上面提到的 `react render function`。

`Component` 和 `React` 组件 之间是一个循环交互的过程，`Component` 跟 `React` 组件 是通过 `setData` 进行交互进而触发 `render`，而 `React` 组件 和 `Component` 之间是通过直接方法调用的形式来交互。这个双向交互的流程就组成了 `MorJS Web runtime` 的内核部分。

从上图也可以看出，`acss` 、`axml` 两个文件其实跟 `Component` 并没有强关系，仅仅是一个渲染函数，根据给定的 `render-data` 而渲染出结果而已，如果把 `Componet(options)` 去掉，也就是把小程序中的 `js` 文件去掉，那么就是一个模板文件，而事实上 `MorJS` 中也是这么实现 `template` 功能的。
