import { addSimilarTarget } from '@morjs/plugin-compiler-alipay'

export const target = 'dingding'
export const targetDescription = '钉钉小程序'

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

export const globalObject = 'dd'
export const resolveMainFields = ['dingding', 'main']
export const defaultConditionalFileExt = '.dd'
export const defaultOutputDir = 'dist/dingding'
export const projectConfigFiles = ['project.dd.json', 'mini.project.json']

// 将当前 target 添加为 支付宝类似小程序
// 以复用 支付宝相关的转换逻辑
addSimilarTarget(target)
