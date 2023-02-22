import { addSimilarTarget } from '@morjs/plugin-compiler-alipay'

export const target = 'taobao'
export const targetDescription = '淘宝小程序'

export {
  compileModuleKind,
  compileScriptTarget,
  fileType,
  getRuntimeFiles,
  isSupportSjsContent,
  sjsModuleAttrName,
  sjsSrcAttrName,
  sjsTagName,
  supportGlobalComponents,
  templateDirectives,
  templateProcessor,
  templateSingleTagNames
} from '@morjs/plugin-compiler-alipay'

export const globalObject = 'my'
export const resolveMainFields = ['taobao', 'main']
export const defaultConditionalFileExt = '.tb'
export const defaultOutputDir = 'dist/taobao'
export const projectConfigFiles = ['project.tb.json', 'mini.project.json']

// 将当前 target 添加为 支付宝类似小程序
// 以复用 支付宝相关的转换逻辑
addSimilarTarget(target)
