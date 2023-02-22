# create-mor

## 生成你的第一个 Mor 项目

> **兼容性提示:**
> mor 需要 [Node.js](https://nodejs.org/en/) 版本 >=12.0.0.

通过 NPM:

```bash
$ npm init mor@latest
```

通过 Yarn:

```bash
$ yarn create mor
```

通过 PNPM:

```bash
$ pnpm create mor
```

然后根据命令行提示并选择!

另外, 你可以通过命令行选项直接指定项目名称或模版，例如:

```bash
# npm 6.x
npm init mor@latest my-mini-app --template wechat

# npm 7+, extra double-dash is needed:
npm init mor@latest my-mini-app -- --template wechat

# yarn
yarn create mor my-mini-app --template miniprogram-wechat-js

# pnpm
pnpm create mor my-mini-app -- --template miniprogram-wechat-js
```

当前支持的模版有:

- `miniprogram-alipay-js`
- `miniprogram-alipay-js-less`
- `miniprogram-alipay-js-sass`
- `miniprogram-alipay-ts-less`
- `miniprogram-alipay-ts-sass`
- `miniprogram-wechat-js`
- `miniprogram-wechat-js-less`
- `miniprogram-wechat-js-sass`
- `miniprogram-wechat-ts-less`
- `miniprogram-wechat-ts-sass`
