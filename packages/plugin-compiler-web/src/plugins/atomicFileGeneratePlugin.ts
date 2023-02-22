import { fileType } from '@morjs/plugin-compiler-alipay'
import { EntryFileType, Plugin, Runner } from '@morjs/utils'

/**
 * 非 bundle 模式下
 * 修改 模版 为 axml.js
 * 修改 样式 为 css
 */
export class AtomicFileGeneratePlugin implements Plugin {
  name = 'MorWebAtomicFileGeneratePlugin'
  apply(runner: Runner) {
    this.alterEntryNameForNonBundleMode(runner)
  }

  alterEntryNameForNonBundleMode(runner: Runner) {
    const styleExtRegExp = new RegExp(`\\${fileType.style}$`)
    runner.hooks.addEntry.tap(this.name, (entryInfo) => {
      if (
        entryInfo.entry.entryFileType === EntryFileType.template ||
        entryInfo.entry.entryFileType === EntryFileType.sjs
      ) {
        const entryName = `${entryInfo.name}.js`
        entryInfo.entry.fullEntryName = entryName
        entryInfo.name = entryName
      } else if (entryInfo.entry.entryFileType === EntryFileType.style) {
        const entryName = entryInfo.name.replace(styleExtRegExp, '.css')
        entryInfo.entry.fullEntryName = entryName
        entryInfo.name = entryName
      }

      return entryInfo
    })
  }
}
