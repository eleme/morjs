# MorJS 介绍

<img src="https://img.alicdn.com/imgextra/i1/O1CN017EoZuR20PghATY7Fw_!!6000000006842-55-tps-485-350.svg" width="126" />

## MorJS 是什么？

MorJS，中文可发音为**魔**，是基于小程序 DSL（支付宝、微信）的，可扩展的多端研发框架。MorJS 以多端编译为基础，配以面向全生命周期的插件体系，覆盖从源码到构建产物的每个阶段，支持各类功能扩展和业务需求。

MorJS 是饿了么的底层小程序前端框架，已直接或间接地服务了 100+ 应用。它已经很好地服务了我们的内部用户，同时希望它也能服务好外部用户。

它主要具备以下功能：

- 💎 **DSL 支持**：支持使用微信小程序 DSL 或 支付宝小程序 DSL 编写小程序
- 🌴 **多端支持**：支持一键转换为各类小程序平台及 Web 应用, 节省双倍人力
- 📦 **开箱即用**：MorJS 内置了脚手架、构建、分析、多端编译等，仅需一个依赖即可上手开发
- 🎉 **方便扩展**：MorJS 实现了完备的生命周期，并使其插件化，MorJS 内部功能也全由插件完成。此外还支持插件和插件集，以满足功能和垂直域的分层需求
- 🚀 **大量自研**：多端组件打包、文档工具、请求库、数据流、复杂小程序集成、小程序形态转换等，满足日常项目的周边需求
- 🚄 **面向未来**：在满足需求的同时，我们也不会停止对新技术的探索。比如 多端扩充等
- 🌍 **企业级**：经饿了么内部 100+ 公司项目的验证，值得信赖

## 什么时候不用 MorJS？

如果你，

- 期望使用 React 或 Vue 的方式来编写小程序
- 期望使用 Web 的方式开发
- 有很强的 webpack 自定义需求和主观意愿
- 需要以 微信小程序或支付宝小程序 DSL 以外的方式开发
- 需要跑在 Node 14 以下的环境中

MorJS 可能不适合你。

## 为什么自研？

**业界开源小程序框架对比 👇🏻**

<table>
  <thead>
    <tr>
      <th width="50"><strong>方案</strong></th>
      <th width="50">──</th>
      <th width="100"><strong>Taro</strong></th>
      <th width="100"><strong>Remax</strong></th>
      <th width="100"><strong>Rax</strong></th>
      <th width="100"><strong>Mpvue</strong></th>
      <th width="100"><strong>uni-app</strong></th>
      <th width="100"><strong>chameleon</strong></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>开源<br/>组织</strong></td>
      <td>──</td>
      <td>京东<br/>凹凸实验室</td>
      <td>支付宝<br/>体验设计部</td>
      <td>淘宝<br/>FED</td>
      <td>美团<br/>FED</td>
      <td>DCloud</td>
      <td>滴滴<br/>FED</td>
    </tr>
    <tr>
      <td rowspan="3"><strong>开发<br/>工具</strong></td>
      <td><strong>DSL</strong></td>
      <td>React</td>
      <td>React</td>
      <td>React</td>
      <td>Vue</td>
      <td>Vue</td>
      <td>类 Vue</td>
    </tr>
    <tr>
      <td><strong>TS</strong> <br/><strong>支持</strong></td>
      <td>有</td>
      <td>有</td>
      <td>有</td>
      <td>有</td>
      <td>有</td>
      <td>无</td>
    </tr>
    <tr>
      <td><strong>样式<br/>支持</strong></td>
      <td>SASS<br/>LESS<br/>Stylus</td>
      <td>SASS<br/>LESS<br/>Stylus</td>
      <td>SASS<br/>LESS<br/>Stylus</td>
      <td>SASS<br/>LESS<br/>Stylus</td>
      <td>SASS<br/>LESS<br/>Stylus</td>
      <td>SASS<br/>LESS<br/>Stylus</td>
    </tr>
    <tr>
      <td rowspan="5"><strong>多端<br/>支持</strong></td>
      <td><strong>小程序<br/>支持</strong></td>
      <td>微信、支付宝、字节、QQ、百度、钉钉、企业微信、Web、React Native</td>
      <td>微信、支付宝、手淘、钉钉、字节、QQ</td>
      <td>微信、支付宝、手淘、字节、快手</td>
      <td>微信、支付宝、百度、字节</td>
      <td>微信、支付宝、字节、QQ、百度、钉钉、淘宝、快应用、Web</td>
      <td>微信、支付宝、字节、QQ、百度、快应用</td>
    </tr>
    <tr>
      <td><strong>移动端<br/>容器</strong></td>
      <td>React Native</td>
      <td>无</td>
      <td>Weex</td>
      <td>无</td>
      <td>Weex</td>
      <td>Weex</td>
    </tr>
    <tr>
      <td><strong>编译<br/>方式</strong></td>
      <td>偏重运行时<br/>无语法限制<br/>性能损耗大</td>
      <td>偏重运行时<br/>无语法限制<br/>性能损耗大</td>
      <td>偏重运行时<br/>无语法限制<br/>性能损耗大</td>
      <td>偏重编译时<br/>语法限制多<br/>性能损耗小</td>
      <td>偏重编译时<br/>语法限制多<br/>性能损耗小</td>
      <td>偏重编译时<br/>语法限制多<br/>性能损耗小</td>
    </tr>
    <tr>
      <td><strong>HTML5<br/>支持</strong></td>
      <td>有</td>
      <td>有</td>
      <td>有</td>
      <td>无</td>
      <td>有</td>
      <td>有</td>
    </tr>
    <tr>
      <td><strong>跨端<br/>组件库</strong></td>
      <td>有</td>
      <td>有</td>
      <td>有</td>
      <td>无</td>
      <td>有</td>
      <td>有</td>
    </tr>
    <tr>
      <td rowspan="3"><strong>生态</strong></td>
      <td><strong>Demo</strong></td>
      <td>丰富</td>
      <td>较少</td>
      <td>较少</td>
      <td>丰富</td>
      <td>丰富</td>
      <td>较少</td>
    </tr>
    <tr>
      <td><strong>状态<br/>管理</strong></td>
      <td>Redux<br/>MobX<br/>Dva</td>
      <td>Redux<br/>MobX<br/>Dva</td>
      <td>Dva</td>
      <td>Vuex</td>
      <td>Vuex</td>
      <td>Vuex</td>
    </tr>
    <tr>
      <td><strong>组件库</strong></td>
      <td>有</td>
      <td>有</td>
      <td>有</td>
      <td>无</td>
      <td>有</td>
      <td>有</td>
    </tr>
    <tr>
      <td rowspan="2"><strong>开源<br/>状态</strong></td>
      <td><strong>社区</strong></td>
      <td>有</td>
      <td>无</td>
      <td>无</td>
      <td>无</td>
      <td>有</td>
      <td>无</td>
    </tr>
    <tr>
      <td><strong>维护<br/>状态</strong></td>
      <td>积极</td>
      <td>积极</td>
      <td>积极</td>
      <td>不维护</td>
      <td>积极</td>
      <td>一般</td>
    </tr>
  </tbody>
</table>

从上面表格可以看出，业界虽然有很多优秀的小程序多端框架，但受限于 3 个主要的问题，无法很好的应用于饿了么：

- **缺少原生 DSL 支持**：上述框架均是以 React 或 Vue 作为主要的 DSL，而饿了么有大量的存量业务是以支付宝或微信 DSL 直接编写的小程序和组件库，迁移工作量巨大。
- **性能开销及使用限制**：上述框架要么重运行时导致运行时性能开销大，不满足饿了么对性能的极致要求；要么重编译时带来了相当程度的语法限制，导致开发是既要关注 Vue 本身语法不能使用的部分也要关注小程序本身的限制，带来了一定的研发和调试成本。
- **缺乏复杂小程序的实践方案**：上述框架均缺乏针对大型复杂小程序的成熟解决方案。
