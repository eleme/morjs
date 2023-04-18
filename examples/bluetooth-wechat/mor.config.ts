import { defineConfig } from '@morjs/cli'

export default defineConfig([
  /**
   * 支付宝小程序编译配置
   */
  {
    name: 'ali',
    sourceType: 'wechat',
    target: 'alipay'
  },
  /**
   * 微信小程序编译配置
   */
  {
    name: 'wechat',
    sourceType: 'wechat',
    target: 'wechat'
  }
])
