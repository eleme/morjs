import { defineConfig } from '@morjs/cli'

export default defineConfig([
  {
    name: 'wechat',
    sourceType: 'wechat',
    target: 'wechat'
  },
  {
    name: 'alipay',
    sourceType: 'wechat',
    target: 'alipay'
  },
  {
    name: 'web',
    sourceType: 'wechat',
    target: 'web',
    web: {
      emitIntermediateAssets: true,
      responsiveRootFontSize: 16,
      showHeader: true
    }
  }
])
