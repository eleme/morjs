import { defineConfig, logger, Plugin, Runner } from '@morjs/cli'

/**
 * NOTE: 插件示例，简单处理示例项目中微信 DSL 转支付宝不兼容的地方
 * MorJS 无法覆盖所有小程序差异，通常情况下可以结合项目实际情况通过插件来自行处理
 */
class TransformUnsupportTagForAlipayPlugin implements Plugin {
  name = 'TransformUnsupportTagForAlipayPlugin'
  apply(runner: Runner) {
    const unsupportedTags = ['i', 'span', 'img', 'h2', 'strong', 'em', 'a']
    runner.hooks.templateParser.tap(this.name, function (tree) {
      return tree.walk((node) => {
        if (!node.tag || !node.attrs) return node
        const attrs = node.attrs

        // 示例项目中出现了 html 元素，这里简单做下兼容
        if (unsupportedTags.includes(node.tag as string)) {
          attrs.class = attrs.class
            ? [attrs.class, node.tag].join(' ')
            : node.tag
          node.tag = 'view'
        }
        // 支付宝 label 不支持 tap 事件
        if (node.tag === 'label' && attrs.bindtap) {
          logger.warnOnce(
            `支付宝 label 标签不支持 tap 事件，将替换为 view 标签`
          )
          node.tag = 'view'
        }
        return node
      })
    })
  }
}

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
    target: 'alipay',
    plugins: [new TransformUnsupportTagForAlipayPlugin()]
  },
  /**
   * 微信小程序转字节小程序编译配置
   */
  {
    name: 'tt',
    sourceType: 'wechat',
    target: 'bytedance'
  },
  /**
   * 微信小程序转百度小程序编译配置
   */
  {
    name: 'baidu',
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
