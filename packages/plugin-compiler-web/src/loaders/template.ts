import AXMLCompile from '../compiler/core/axml2/index'
import { LoaderBuilder } from './builder'

export default function (source: string) {
  LoaderBuilder.process(this, async function (options) {
    return AXMLCompile(source, {
      ...options,
      hasAppStyle: !!options.appStyleFilePath,
      hasStyleFile: !!options.styleFilePath
    })
  })
}
