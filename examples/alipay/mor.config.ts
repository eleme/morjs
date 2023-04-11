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
   * 支付宝小程序转 Web 编译配置
   */
  {
    name: 'web',
    sourceType: 'alipay',
    target: 'web',
    globalObject: 'customMy',
    web: {
      showBack: true,
      responsiveRootFontSize: 16,
      devServer: {
        host: 'local-ip',
        port: 8888
      },
      appConfig: {
        apiNoConflict: false,
        components: {
          map: {
            sdk: '', // 地图 sdk 地址
            version: '', // 地图 sdk 版本
            key: '' // 个人地图 key
          }
        }
      }
    }
  }
])
