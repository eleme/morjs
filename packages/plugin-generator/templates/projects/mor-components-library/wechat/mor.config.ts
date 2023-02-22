import { defineConfig } from '@morjs/cli'

export default defineConfig([
  {
    name: 'ali',
    sourceType: 'wechat',
    target: 'alipay',
  },
  {
    name: 'wechat',
    sourceType: 'wechat',
    target: 'wechat',
  },
])
