import JSCompiler from '../compiler/core/js/index'
import { LoaderBuilder } from './builder'

export default function (source: string) {
  LoaderBuilder.process(this, async function (options) {
    return JSCompiler(source, options)
  })
}
