<p align="center">
 <a href="https://github.com/eleme/morjs"><img src="https://img.alicdn.com/imgextra/i3/O1CN01l7Xw6O1E1K4OCFYmw_!!6000000000291-2-tps-485-350.png" width="150" /></a>
</p>

<div align="center">

[![NPM Version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![PRs Welcome][pr-image]][pr-url]
[![CLA assistant][cla-image]][cla-url]
[![Discussions][discussions-image]][discussions-url]

[discussions-image]: https://img.shields.io/badge/discussions-on%20github-blue
[discussions-url]: https://github.com/eleme/morjs/discussions
[pr-image]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
[pr-url]: https://github.com/eleme/morjs/pulls
[npm-image]: https://img.shields.io/npm/v/@morjs/cli.svg
[npm-url]: https://www.npmjs.com/package/@morjs/cli
[license-image]: https://img.shields.io/npm/l/@morjs/cli.svg
[license-url]: https://github.com/eleme/morjs/blob/main/LICENSE
[cla-image]: https://cla-assistant.io/readme/badge/eleme/mor
[cla-url]: https://cla-assistant.io/eleme/mor

</div>

<h1 align="center">MorJS</h1>

<p align="center">Mor (发音为 /mɔːr/，类似 more)，是饿了么开发的一款基于小程序 DSL 的，可扩展的多端研发框架，使用小程序原生 DSL 构建，使用者只需书写一套（微信或支付宝）小程序，就可以通过 Mor 的转端编译能力，将源码分别编译出可以在不同端（<a href='https://developers.weixin.qq.com/miniprogram/dev/framework/' target='_blank'>微信</a>/<a href='https://opendocs.alipay.com/mini/development' target='_blank'>支付宝</a>/<a href='https://smartprogram.baidu.com/developer/index.html' target='_blank'>百度</a>/<a href='https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/introduction/overview/' target='_blank'>字节</a>/<a href='https://open.dingtalk.com/document/orgapp/develop-org-mini-programs' target='_blank'>钉钉</a>/<a href='https://mp.kuaishou.com/docs/develop/guide/introduction.html' target='_blank'>快手</a>/<a href='https://q.qq.com/wiki/develop/miniprogram/frame/' target='_blank'>QQ</a>/<a href='https://miniapp.open.taobao.com/docV3.htm?docId=117766&docType=1' target='_blank'>淘宝</a>/H5…）运行的产物。</p>

<p align="center">MorJS 以多端编译为基础，配以面向全生命周期的插件体系，覆盖从源码到构建产物的每个阶段，支持各类功能扩展和业务需求，无论是基础的页面和组件还是复杂的分包和插件，MorJS 都可以胜任，帮助你高效地开发多端小程序。</p>

### [📚 快速上手 MorJS →](https://mor.eleme.io/guides/introduction/getting-started)

## 优势与核心能力

Mor 是一套基于小程序 DSL (支付宝或微信) 的框架。他的易用性、标准化和灵活性，使得开发者能更好地专注于业务，让开发成本，招聘、管理、测试各方面成本都大幅下降，提高开发者的工作效率。

- ⭐️ **易用性**：
  - 💎 **DSL 支持**：可使用微信小程序 DSL 或 支付宝小程序 DSL 编写小程序，无额外使用成本；
  - 🌴 **多端支持**：支持将一套小程序转换为各类小程序平台及 Web 应用, 节省双倍人力；
  - 🚀 **快速接入**：仅需引入两个包，增加一个配置文件，即可简单快速接入到现有小程序项目；
- 🌟 **标准化**：
  - 📦 **开箱即用**：内置了脚手架、构建、分析、多端编译等完整研发能力，仅需一个依赖即可上手开发；
  - 🌈 **表现一致**：通过编译时+运行时抹平多端差异性，让不同平台的小程序获得一致的用户体验；
  - 🖇 **形态转换**：支持同一个项目的不同的形态，允许小程序、分包、插件不同形态之间的相互转换；
- ✨ **灵活性**：
  - 🎉 **方便扩展**：Mor 将完备的生命周期和内部功能插件化，使用插件(集)以满足功能和垂直域的分层需求；
  - 📚 **类型支持**：除小程序标准文件类型外，还支持 ts、less/scss、jsonc/json5 等多种文件类型；
  - 🧰 **按需适配**：可根据需求选择性接入适配能力，小项目仅需编译功能，中等项目可结合编译和页面注入能力，大型项目推荐使用复杂小程序集成能力；

## 贡献

参见 [贡献指南](https://github.com/eleme/morjs/blob/master/CONTRIBUTING.md)

## 社区

参见 [社区指南](https://mor.eleme.io/about/community-guide)

### 核心成员

核心成员是在 MorJS 相关问题、BUG 修复、功能增强、新特性添加等方便投入大量的时间和精力的社区贡献者。

- [lyfeyaj](https://github.com/lyfeyaj)
- [BboyZaki](https://github.com/BboyZaki)
- [hwaphon](https://github.com/hwaphon)
- [shujian-cao](https://github.com/shujian-cao)
- [robin-shine](https://github.com/robin-shine)

## 许可证

[MIT](https://github.com/eleme/morjs/blob/master/LICENSE)
