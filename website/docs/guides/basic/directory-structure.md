# 目录结构

这里罗列了 MorJS 项目中约定(或推荐)的目录结构，在项目开发中，请遵照这个目录结构组织代码。

```text
├── .mor                          - 临时目录
├── dist                          - 产物目录
│   ├── alipay                    - 支付宝小程序产物
│   └── wechat                    - 微信小程序产物
├── mock                          - Mock 文件目录
├── src                           - 源码目录
│   ├── assets                    - 静态资源
│   │   └── logo.png              - 图片
│   ├── components                - 小程序自定义组件目录
│   │   └── add-button            - 自定义组件
│   │       ├── add-button.axml   - 自定义组件模版文件
│   │       ├── add-button.json   - 自定义组件配置文件
│   │       ├── add-button.less   - 自定义组件样式文件
│   │       └── add-button.ts     - 自定义组件脚本文件
│   ├── pages                     - 小程序页面目录
│   │   ├── add-todo              - 页面
│   │   │   ├── add-todo.axml     - 页面模版文件
│   │   │   ├── add-todo.json     - 页面配置文件
│   │   │   ├── add-todo.less     - 页面样式文件
│   │   │   └── add-todo.ts       - 页面脚本文件
│   │   └── todos                 - 页面
│   │       ├── todos.axml        - 页面模版文件
│   │       ├── todos.json        - 页面配置文件
│   │       ├── todos.less        - 页面样式文件
│   │       └── todos.ts          - 页面脚本文件
│   ├── app.json                  - 小程序全局配置文件
│   ├── app.less                  - 小程序全局样式文件
│   ├── app.ts                    - 小程序全局入口文件
│   ├── mini.project.json         - 支付宝小程序项目配置文件
│   └── project.config.json       - 微信小程序项目配置文件
├── README.md                     - 项目说明文档
├── .env                          - 环境变量文件
├── mor.config.ts                 - MorJS 配置文件
├── package.json                  - package.json 文件
└── tsconfig.json                 - typescript 配置文件
```

## 根目录

### package.json

包含插件和项目依赖。

### .env

环境变量，比如：

```text
PORT=8888
CACHE=none
```

### mor.config.ts

配置文件，包含 MorJS 内置功能和插件的配置。

### .mor 目录

编译或集成时的临时文件目录，比如编译中间产物、集成模块产物等，都会被临时生成到这里。**不要提交 .mor 目录到 git 仓库，他们可能会在 MorJS 命令执行期间被更新或删除并重新生成。**

### dist 目录

执行 `mor compile` 或 `mor compose` 或 `mor pack` 等命令后，产物默认会存放在这里。可通过配置修改产物输出路径。

### mock 目录

存储 mock 文件，此目录下所有 `.ts` `.mjs` `.jsonc` `.json5` `.json` `.js` `.cjs` 类型格式文件会被解析为 mock 文件，优先级顺序依次，用于本地的模拟数据服务。

### `src` 目录

源代码目录。
