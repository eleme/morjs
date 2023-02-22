import { defineConfig } from '@morjs/cli'

export default defineConfig([
  {
    name: 'ali',
    sourceType: 'wechat',
    outputPath: './alipay/lib',
    target: 'alipay',
    autoClean: true,
    autoInjectRuntime: {
      api: 'minimal',
    },
    compilerOptions: {
      esModuleInterop: false,
      declaration: true,
      target: 'ES5',
      module: 'CommonJS',
    },
    compileMode: 'default',
    srcPath: './src/components',
  },
  {
    name: 'wechat',
    sourceType: 'wechat',
    outputPath: './miniprogram_dist/lib',
    target: 'wechat',
    autoClean: true,
    autoInjectRuntime: {
      api: 'minimal',
    },
    compilerOptions: {
      esModuleInterop: false,
      declaration: true,
      target: 'ES5',
      module: 'CommonJS',
    },
    compileMode: 'default',
    srcPath: './src/components',
  },
])
