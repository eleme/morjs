import _ from 'lodash.clonedeep'
import { KBComponent } from './component'
// import { MixinPageForHot } from './page-hot';
import ComponentMixin from './component-mixin'
// import { MixinComponentForHot } from './component-hot'
import { PageComponent } from './page'

window.Component = function (options) {
  window.$$options$$ = options
}

type IAxmlInfoType = {
  defaultRender: (this: Record<string, any>, data: Record<string, any>) => any
  isComplexComponents?: boolean
}

/**
 * 组件构造函数
 * @param axmlInfo 初始化函数
 */
export function Component(axmlInfo: IAxmlInfoType): any {
  // if (module.hot) {
  //   return MixinComponentForHot(componentInit || {}, render, config);
  // } else {
  return MixinComponent(axmlInfo)
  // }
}

function cloneInitOptions(options: Record<string, any>) {
  try {
    const whiteList = ['$event']
    const tempSaveObj = {}

    whiteList.forEach((key) => {
      options[key] && (tempSaveObj[key] = options[key])
    })
    return { ..._(options), ...tempSaveObj }
  } catch (e) {}

  return _(options)
}

function MixinComponent(axmlInfo: IAxmlInfoType) {
  const componentInit = ComponentMixin(window.$$options$$ || {})
  delete window.$$options$$
  const { defaultRender: render, isComplexComponents } = axmlInfo
  const componentData = componentInit.data
  delete componentInit.data
  return class extends KBComponent {
    constructor(props) {
      // data 的数据 对象可以共享。 这个是支付宝的逻辑，真是奇葩。
      const cloneObj = cloneInitOptions(componentInit)
      cloneObj.data = { ...componentData }
      super(props, cloneObj, { isComplexComponents, isComponent: true })
    }

    override render() {
      if (render) {
        return render.call(this.componentConfig, this.getRenderData())
      }
      return false
    }
  }
}

export function Page(
  axmlInfo: IAxmlInfoType,
  config: Record<string, any>
): any {
  // if (module.hot) {
  //   return MixinPageForHot(componentInit || {}, render, config)
  // } else {
  return MixinPage(axmlInfo, config)
  // }
}
window.Page = function (options) {
  window.$$options$$ = options
}

function MixinPage(axmlInfo: IAxmlInfoType, config: Record<string, any>) {
  const componentInit = window.$$options$$ || {}
  delete window.$$options$$
  const { defaultRender: render, isComplexComponents } = axmlInfo
  return class extends PageComponent {
    constructor(props: Record<string, any>) {
      super(props, cloneInitOptions(componentInit), config, {
        isComplexComponents
      })
      // 设置标题
      window.document.title =
        config.window.defaultTitle || window.document.title || ''
    }

    override render() {
      if (render) {
        return render.call(this.componentConfig, this.getRenderData())
      }
      return false
    }
  }
}
