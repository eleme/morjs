import { defineConfig } from '@morjs/cli'

export default defineConfig([
  /**
   * 微信小程序编译配置
   */
  {
    name: 'wechat',
    sourceType: 'wechat',
    target: 'wechat'
  },
  /**
   * 微信小程序转支付宝小程序编译配置
   */
  {
    name: 'alipay',
    sourceType: 'wechat',
    target: 'alipay'
  },
  /**
   * 微信小程序转字节小程序编译配置
   */
  {
    name: 'tt',
    sourceType: 'wechat',
    target: 'bytedance'
  },
  {
    name: 'swan',
    sourceType: 'wechat',
    target: 'baidu'
  },
  /**
   * 微信小程序转 Web 编译配置
   */
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
