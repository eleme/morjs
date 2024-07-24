import type { Plugin as MorPlugin, Runner } from '@morjs/utils'
import AlipayCompilerConfigParserPlugin from './plugins/ConfigParserPlugin'
import CustomTabBarPlugin from './plugins/CustomTabBarPlugin'
import AlipayCompilerSjsParserPlugin from './plugins/SjsParserPlugin'
import AlipayCompilerStyleParserPlugin from './plugins/StyleParserPlugin'
import AlipayCompilerTemplateParserPlugin from './plugins/TemplateParserPlugin'

export * from './constants'
export * from './runtimeConfig'
export { templateProcessor } from './templateProcessor'

class AlipayCompilerPlugin implements MorPlugin {
  name = 'AlipayCompilerPlugin'

  apply(runner: Runner) {
    new AlipayCompilerSjsParserPlugin().apply(runner)
    new AlipayCompilerStyleParserPlugin().apply(runner)
    new AlipayCompilerConfigParserPlugin().apply(runner)
    new AlipayCompilerTemplateParserPlugin().apply(runner)
    new CustomTabBarPlugin().apply(runner)
  }
}

export const Plugin = AlipayCompilerPlugin
