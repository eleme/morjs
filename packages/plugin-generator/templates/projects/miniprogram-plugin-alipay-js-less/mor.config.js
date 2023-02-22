import { defineConfig } from '@morjs/cli'

export default defineConfig([
  {
    name: 'alipay-plugin',
    sourceType: 'alipay',
    target: 'alipay',
    compileType: 'plugin',
    compileMode: 'bundle',
    compose: true,
    host: {
      file: './miniprogram'
    }
  },
  {
    name: 'wechat-plugin',
    sourceType: 'alipay',
    target: 'wechat',
    compileType: 'plugin',
    compileMode: 'bundle',
    compose: true,
    host: {
      file: './miniprogram'
    }
  }
])
