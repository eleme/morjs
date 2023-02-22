import { forceCheckFunctionChanged } from './component-hot'
import { PageComponent } from './page'
let $HotId = 1

function forceCheckConfig(oldConfig, newConfig) {
  // 强制检查一次性调用的生命周期函数是否有更改，如有更改，那么强制调用
  forceCheckFunctionChanged(oldConfig, newConfig, 'onReady')
  forceCheckFunctionChanged(oldConfig, newConfig, 'onLoad')
  forceCheckFunctionChanged(oldConfig, newConfig, 'onShow')
}

// 支持热更新
export function MixinPageForHot(componentInit, render, config) {
  componentInit.__HotId__ = ++$HotId
  return class extends PageComponent {
    constructor(props) {
      const compConfig = componentInit()
      compConfig.__HotId__ = componentInit.__HotId__
      super(props, compConfig, config)
      // 设置标题
      window.document.title =
        config.window.defaultTitle || window.document.title || ''
    }

    onInit() {
      if (this.componentConfig.__HotId__ === componentInit.__HotId__) {
        super.onInit()
      }
    }

    render() {
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
