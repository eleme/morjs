// eslint-disable-next-line node/no-missing-import
import type { KBComponent } from '../public/component'
import type TemplateManager from './template'

/**
 *
 * @param {*} tm templateManager
 */
export function axmlApi(tm: TemplateManager) {
  return {
    template(parent: KBComponent, tName: string, data: Record<string, any>) {
      return tm.renderTemplate(tName, data, parent)
    }
  }
}
