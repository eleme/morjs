// eslint-disable-next-line node/no-missing-import
import { KBComponent } from '../public/component'

const HashChars =
  'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678oOLl9gqVvUuI1'
// 对模板名称进行编码
// NOTE: 这里的代码必须跟runtime中的代码是一致的
function hashTemplateName(name: string) {
  return name
    .split('')
    .map((c) => (HashChars.indexOf(c) >= 0 ? c : '$'))
    .join('')
}

export default class TemplateManager {
  private templates
  constructor() {
    this.templates = {}
  }

  // add(tempRender) {
  //   if (this.templates[tempRender.name]) {
  //     console.warn('存在相同名称的模板')
  //   }
  //   this.templates[tempRender.name] = tempRender.render;
  // }

  addAll(obj: Record<string, any>) {
    Object.keys(obj).forEach((key) => {
      if (key.startsWith('template')) {
        this.templates[key] = obj[key]
      }
    })
  }

  renderTemplate(
    name: string,
    data: Record<string, any>,
    superComponent: KBComponent
  ) {
    if (!name) {
      throw new Error('name 不能为空')
    }
    if (typeof name !== 'string') {
      throw new Error('name 必须是字符串')
    }
    if (data && typeof data !== 'object') {
      throw new Error('data 必须是对象. template name=' + name)
    }
    const t = this.templates[`template${hashTemplateName(name)}`]
    if (t) {
      const d = data || {}
      // 合并父级组件。以便后续递归传递数据
      if (
        !d['$reactComp'] &&
        superComponent &&
        superComponent instanceof KBComponent
      ) {
        d['$reactComp'] = superComponent
        d['$root'] = superComponent.componentConfig
        d['$id'] = superComponent.$id
      }
      return t.call(d['$root'], d)
    } else {
      console.warn('模板不存在:' + name)
    }
    return null
  }
}
