import ACSSBuilder from '../compiler/core/acss/index'
import { LoaderBuilder } from './builder'

export default function (source: string) {
  LoaderBuilder.process(this, async function (options) {
    return ACSSBuilder(source, options)
  })
}
