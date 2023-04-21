import { FileParserOptions, posthtml } from '@morjs/utils'

export type PostHtmlCustomPlugin = (
  tree: posthtml.Node,
  options: FileParserOptions
) =>
  | ReturnType<posthtml.Plugin<any>>
  | Promise<ReturnType<posthtml.Plugin<any>>>

export async function templateTransformer(
  fileContent: string,
  options: FileParserOptions,
  singleTags: string[],
  closingSingleTag?: '' | 'slash' | 'tag',
  parser?: PostHtmlCustomPlugin
): Promise<string> {
  const ph = posthtml()

  if (parser) ph.use(async (node) => await parser(node, options))

  return (
    await ph.process(fileContent, {
      // 并开启无值属性的识别
      recognizeNoValueAttribute: true,
      recognizeSelfClosing: true,
      closingSingleTag: closingSingleTag ?? 'slash',
      // 0 代表  smart quote, 自动判断 " 或 '
      quoteStyle: 0,
      replaceQuote: false,
      singleTags
    })
  ).html
}
