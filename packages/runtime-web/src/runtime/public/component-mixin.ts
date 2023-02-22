/**
 * 组件支持混入功能
 * @param {*} options
 */
export default function (options) {
  const mixins = options.mixins
  if (mixins && mixins instanceof Array) {
    mixins.forEach((mixin) => {
      if (typeof mixin === 'object') {
        for (const key in mixin) {
          const value = mixin[key]
          switch (key) {
            case 'data': {
              options.data = { ...value, ...options.data }
              break
            }
            case 'props': {
              options.props = { ...value, ...options.props }
              break
            }
            case 'methods': {
              options.methods = { ...value, ...options.methods }
              break
            }
            // 生命周期函数
            case 'didUnmount':
            case 'didUpdate':
            case 'deriveDataFromProps':
            case 'didMount':
            case 'onInit': {
              mergeFuction(options, key, value)
              break
            }
            default: {
              options[key] = value
              break
            }
          }
        }
      }
    })
    delete options.mixins
  }
  return options
}

function mergeFuction(options, name, func) {
  if (!func || typeof func !== 'function') return
  const orgini = options[name]
  if (orgini && typeof orgini === 'function') {
    options[name] = function (...args) {
      // TODO: need try catch ???
      orgini.call(this, ...args)
      func.call(this, ...args)
    }
  } else {
    options[name] = func
  }
}
