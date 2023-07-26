import { defineConfig } from '@morjs/cli'

export default defineConfig([
  {
    name: 'wechat-plugin',
    sourceType: 'wechat',
    target: 'wechat',
    compileType: 'plugin',
    compileMode: 'bundle',
    compose: true,
    host: {
      file: './miniprogram'
    }
  },
  {
    name: 'alipay-plugin',
    sourceType: 'wechat',
    target: 'alipay',
    compileType: 'plugin',
    compileMode: 'bundle',
    compose: true,
    host: {
      file: './miniprogram'
    }
  },
  <% if (isSupportWeb) { %>{
    name: 'web',
    sourceType: 'wechat',
    target: 'web',
    compileType: 'plugin',
    compileMode: 'bundle',
  }<% } %>
])
