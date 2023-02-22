const getDefaultConfig = (config) => {
  const { duration, timeFunction, delay, transformOrigin } = config || {}

  return {
    duration: duration || 400,
    timeFunction: timeFunction || 'linear',
    delay: delay || 0,
    transformOrigin: transformOrigin || '50% 50% 0'
  }
}

const METHOD = [
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'rotate3d',
  'scale',
  'scaleX',
  'scaleY',
  'scaleZ',
  'scale3d',
  'translate',
  'translateX',
  'translateY',
  'translateZ',
  'translate3d',
  'skew',
  'skewX',
  'skewY',
  'matrix',
  'matrix3d',
  'opacity',
  'backgroundColor',
  'width',
  'height',
  'top',
  'left',
  'right',
  'bottom'
]

export default class Animation {
  result = []
  currentStep = null
  initConfig = null

  constructor(config) {
    this.initConfig = getDefaultConfig(config)
    this.currentStep = this._generateStep(config)

    // 挂载支持的方法
    METHOD.forEach((item) => {
      this._mount(item, (...params) => {
        this._push(item, params)
        return this
      })
    })
  }

  _generateStep(config) {
    return {
      animation: [],
      config: getDefaultConfig(config)
    }
  }

  _mount(property, callback) {
    this[property] = callback
    return this
  }

  _push(property, value) {
    const { animation } = this.currentStep

    animation.push([property, value])
    this.currentStep.animation = animation
  }

  _hasAnimation() {
    const { animation } = this.currentStep

    return Array.isArray(animation) && animation.length > 0
  }

  step(config) {
    this.result.push(this.currentStep)
    this.currentStep = this._generateStep(config)
    return this
  }

  export() {
    const temp = this.result

    if (this._hasAnimation()) {
      temp.push(this.currentStep)
      this.currentStep = this._generateStep(this.initConfig)
    }

    this.result = []

    return temp
  }
}
