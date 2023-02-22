import { defineConfig } from '@morjs/cli'

export default defineConfig([
  {
    name: 'ali',
    sourceType: 'alipay',
    target: 'alipay',
    compileType: 'miniprogram',
    compileMode: 'bundle'
  },
  {
    name: 'web',
    sourceType: 'alipay',
    target: 'web',
    compileType: 'miniprogram',
    compileMode: 'bundle',
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
