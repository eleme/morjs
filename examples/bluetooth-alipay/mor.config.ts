import { defineConfig } from '@morjs/cli'

export default defineConfig([
  /**
   * 支付宝小程序编译配置
   */
  {
    name: 'ali',
    sourceType: 'alipay',
    target: 'alipay'
  },
  /**
   * 微信小程序编译配置
   */
  {
    name: 'wechat',
    sourceType: 'alipay',
    target: 'wechat'
  }
])
