# MorJS 站点

## 框架

站点采用 [Docusaurus 2](https://docusaurus.io/) 框架，要求 node 版本 >=16.14

- Installation: `$ npm install`
- Development: `$ npm run start`
- Build: `$ npm run build`
- Version: `npx docusaurus docs:version 1.1.0`

> 发完版本号 Version 后需要修改一下 `docusaurus.config.js` 配置文件的 `onlyIncludeVersions` 相关配置项

## 配置

- 主要配置文件 `docusaurus.config.js`
- 头部导航配置 `config/navbar.js`
- 底部超链配置 `config/footer.js`
- 文档分组配置 `config/sidebars.js`

## 发布

使用 gh-pages 分支为文档专用分支
