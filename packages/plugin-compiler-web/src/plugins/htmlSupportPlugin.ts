import {
  asArray,
  expandExtsWithConditionalExt,
  lookupFile,
  Plugin,
  resolveDependency,
  Runner,
  WebpackWrapper
} from '@morjs/utils'
import type { WebCompilerUserConfig } from '../constants'
import { globalObject as DEFAULT_GLOBAL_OBJECT } from '../constants'

// 默认 html webpack plugin 的模本生成函数
// 可以通过填写  htmlTemplateParameters 来指定 title 和 description
function htmlTemplateContent(opts: {
  title: string
  description?: string
}): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${opts?.description || ''}" />
    <title>${opts?.title || ''}</title>
    <style>
      body, html {
        margin: 0;
        padding: 0;
        user-select: none;
        overflow: hidden;
      }
    </style>
  </head>
  <body></body>
</html>`
}

/**
 * html 支持插件
 * 1. 自动载入 index.ejs 或 index.html, 并提供文件纬度条件编译支持
 * 2. 支持 $tigaMy 自定义并注入到 html
 * 3. 支持 html 压缩
 * 4. 支持 template 配置
 */
export class HtmlSupportPlugin implements Plugin {
  name = 'MorWebHtmlSupportPlugin'
  constructor(public wrapper: WebpackWrapper) {}
  apply(runner: Runner<any>) {
    this.setupHtmlSupport(runner)
  }

  /**
   * 配置 html 支持
   */
  setupHtmlSupport(runner: Runner) {
    const userConfig = runner.userConfig
    const {
      xmlMinimizer,
      srcPaths,
      conditionalCompile: { fileExt: conditionalFileExt },
      web = {},
      globalObject
    } = userConfig as {
      xmlMinimizer: boolean | string | object
      srcPaths: string[]
      conditionalCompile: { fileExt: string | string[] }
      globalObject: string
    } & WebCompilerUserConfig

    const wrapper = this.wrapper
    const chain = wrapper.chain

    // 配置 html 插件
    const HtmlWebpackPlugin = require(resolveDependency('html-webpack-plugin'))

    // 添加 html-webpack-plugin 插件
    runner.hooks.compiler.tap(this.name, (compiler) => {
      compiler.hooks.compilation.tap(this.name, (compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tap(
          this.name,
          (obj: Record<string, any>) => {
            const scriptObj = {
              tagName: 'script',
              voidTag: false,
              meta: { plugin: this.name },
              attributes: {},
              innerHTML: ''
            }

            // 支持自定义全局接口名称
            if (globalObject && globalObject !== DEFAULT_GLOBAL_OBJECT) {
              scriptObj.innerHTML = `window.$MOR_GLOBAL_OBJECT=${JSON.stringify(
                globalObject
              )};`
            }

            // 支持用户自定义全局变量名称，防止自定义变量名与业务变量冲突
            if (web && typeof web.appConfig === 'object') {
              scriptObj.innerHTML += `window.$MOR_APP_CONFIG=${JSON.stringify(
                web.appConfig
              )};`
            }

            // 以上两步操作有值之后，就生成 script 标签插入到head中
            if (scriptObj.innerHTML) {
              obj.headTags = obj.headTags || []
              obj.headTags.unshift(scriptObj)
            }

            return obj
          }
        )
      })
    })

    // 支持配置多个 htmlOptions
    asArray(web.htmlOptions || {}).forEach((options, i) => {
      const htmlOptions: Record<string, any> = {
        // 压缩配置
        minify: xmlMinimizer
          ? {
              collapseWhitespace: true,
              keepClosingSlash: true,
              removeComments: true,
              removeRedundantAttributes: true,
              removeScriptTypeAttributes: true,
              removeStyleLinkTypeAttributes: true,
              useShortDoctype: true,
              minifyCSS: true,
              minifyJS: true
            }
          : false,
        ...(options || {})
      }

      // 如果用户未配置 html 内容
      // 则尝试载入 index.ejs 或 index.html 以及相关条件编译文件
      // 如果均未找到, 则使用缺省的 htmlTemplateContent
      if (!htmlOptions.htmlTemplateContent && !htmlOptions.template) {
        const extnames = expandExtsWithConditionalExt(
          ['.ejs', '.html'],
          conditionalFileExt
        )
        const templatePath = lookupFile(srcPaths, ['index'], extnames, {
          pathOnly: true
        })

        if (templatePath) {
          htmlOptions.template = templatePath
        } else {
          htmlOptions.templateContent = htmlTemplateContent
        }
      }

      chain
        .plugin(`html-webpack-plugin-${i}`)
        .use(HtmlWebpackPlugin, [htmlOptions])
    })
  }
}
