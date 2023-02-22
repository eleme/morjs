// eslint-disable-next-line node/no-missing-import
import { KBComponent } from './component'

let $HotId = 1
// 支持热更新
export function MixinComponentForHot(componentInit, render): any {
  componentInit.__HotId__ = ++$HotId
  return class extends KBComponent {
    constructor(props) {
      const compConfig = componentInit()
      compConfig.__HotId__ = componentInit.__HotId__
      super(props, compConfig, {})
    }

    override onInit() {
      if (this.componentConfig.__HotId__ === componentInit.__HotId__) {
        super.onInit()
      }
    }

    override render() {
      if (render) {
        if (this.componentConfig.__HotId__ !== componentInit.__HotId__) {
          const compConfig = componentInit()
          compConfig.__HotId__ = componentInit.__HotId__
          const oldConfig = this.componentConfig
          this.forceResetConfig(compConfig)
          // 数据强制合并。使得通过setData设置的数据得以保留
          Object.assign(compConfig.data, oldConfig.data)
          // 强制合并props
          this.mergeProps(this.props)
          forceCheckConfig(oldConfig, this.componentConfig)
        }
        return render.call(this.componentConfig, this.getRenderData())
      }
      return false
    }
  }
}

export function forceCheckFunctionChanged(oldConfig, newConfig, name) {
  const oldF = oldConfig[name]
  const newF = newConfig[name]
  if ((oldF ? oldF.toString() : '') !== (newF ? newF.toString() : '')) {
    if (newF) {
      try {
        newConfig[name]()
      } catch (e) {
        console.error(e)
      }
    }
  }
}

function forceCheckConfig(oldConfig, newConfig) {
  // 强制检查一次性调用的生命周期函数是否有更改，如有更改，那么强制调用
  forceCheckFunctionChanged(oldConfig, newConfig, 'onInit')
  forceCheckFunctionChanged(oldConfig, newConfig, 'didMount')
}
