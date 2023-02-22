import { defineConfig } from '@morjs/cli'

export default defineConfig([
  {
    name: 'alipay-subpackage',
    sourceType: 'alipay',
    target: 'alipay',
    compileType: 'subpackage',
    compileMode: 'bundle'
  },
  {
    name: 'wechat-subpackage',
    sourceType: 'alipay',
    target: 'wechat',
    compileType: 'subpackage',
    compileMode: 'bundle'
  }
])
