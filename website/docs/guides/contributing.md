# 参与贡献

❤️ 喜欢 MorJS 并且希望能够参与到其中？非常欢迎！

## 环境准备

### Node.js 和 pnpm

开发 MorJS 需要 Node.js 14+ 和 `pnpm` v7。

推荐使用 [`nvm`](https://github.com/nvm-sh/nvm) 管理 Node.js，避免权限问题的同时，还能够随时切换当前使用的 Node.js 的版本。在 Windows 系统下的开发者可以使用 [`nvm-windows`](https://github.com/coreybutler/nvm-windows)。

在 `pnpm` 的[官网](https://pnpm.io/installation)选择一种方式安装即可。

### Clone 项目

```bash
git clone git@github.com:eleme/morjs.git
cd morjs
```

### 安装依赖并构建

```bash
pnpm i && pnpm bootstrap && pnpm build
```

## 开发 MorJS

### 启动 dev 命令

本地开发 MorJS 必开命令，用于编译 `src` 下的 TypeScript 文件到 `dist` 或 `lib` 目录，同时监听文件变更，有变更时增量编译。

```bash
pnpm dev
```

如果觉得比较慢，也可以只跑特定 package 的 `pnpm dev` 命令，比如。

```bash
pnpm dev -- plugin-compiler
```

### 跑 Example

`examples` 目录下保存了各种用于测试的例子，跑 example 是开发 MorJS 时确认功能正常的常用方式。每个 example 都配了 dev 脚本，所以进入 example 然后执行 `pnpm dev` 即可。

```bash
cd examples/alipay
pnpm dev
```

## 贡献 MorJS 文档

MorJS 的文档由 [Docusaurus](https://docusaurus.io) 实现。在根目录执行如下命令即可开始 MorJS 文档的开发：

```bash
# 安装 MorJS 文档依赖
$ pnpm docs:deps

# 启动 MorJS 文档开发
# 首次启动时编译耗时较长，请耐心等待
$ pnpm docs:start
```

打开指定的端口号，即可实时查看文档更新的内容。

### 撰写 MorJS 文档

MorJS 文档的编写基于 MDX 格式。MDX 是 Markdown 格式的拓展，允许您在撰写 MorJS 文档时插入 JSX 组件。

<Message type="success">
MDX 文档示例
</Message>

在根目录执行如下命令可以格式化仓库中已有的 MorJS 文档：

```bash
pnpm format:docs
```

格式化文档后，建议**仅提交您撰写或修改的 MorJS 文档**。不同文档贡献者的写作风格有一定的差异，格式化以后不一定能保留原来期望的样式。

## 新增 package

新增 package 有封装脚本，无需手动复制 `package.json` 等文件：

```bash
# 创建 package 目录
$ mkdir packages/foo

# 初始化 package 开发
$ pnpm bootstrap
```

## 发布

只有 Core Maintainer 才能执行发布。

```bash
pnpm release
```

## 加入 Contributor 群

提交过 Bugfix 或 Feature 类 PR 的同学，如果有兴趣一起参与维护 MorJS，可用钉钉扫下方二维码加入到 MorJS 社区钉钉群与我们交流。

<img width='260' src="https://img.alicdn.com/imgextra/i4/O1CN016aAsJu24wttvEywXv_!!6000000007456-2-tps-400-400.png" />

如果你不知道可以贡献什么，可以到源码里搜 TODO 或 FIXME 找找。
