import { my } from '../../../../../api/my'
import { styleProperties, stylePropertyMap, toolsProperties } from './const'
import { CanvasActionVo, CanvasElement, CreatePatternRepeatType } from './types'
import { getImage, randomUuid, upperFirstChar } from './utils'

export default class Canvas {
  private ctx: CanvasRenderingContext2D
  private canvas: CanvasElement
  private canvasWidth: string
  private canvasHeight: string
  private actions: Array<CanvasActionVo> = []
  private drawActionGroup: Array<CanvasActionVo> = []
  private devicePixelRatio = 1

  static create(canvasId: string) {
    return new Canvas(canvasId)
  }

  constructor(canvasId: string) {
    this.devicePixelRatio = (<any>my).getSystemInfoSync().pixelRatio || 1
    this.canvas = (
      my.createSelectorQuery().select(`#${canvasId}`) as any
    ).target // document.getElementById(canvasId);
    if (this.canvas) {
      const canvas: CanvasElement = this.canvas.shadowRoot.querySelectorAll(
        'canvas'
      )[0] as CanvasElement
      const wrapper: CanvasElement =
        this.canvas.shadowRoot.querySelectorAll('div')[0]
      this.canvasWidth =
        (window.getComputedStyle(this.canvas as Element).width ||
          canvas.width) + ''
      this.canvasHeight =
        (window.getComputedStyle(this.canvas as Element).height ||
          canvas.height) + ''
      canvas.setAttribute('width', String(wrapper.offsetWidth))
      canvas.setAttribute('height', String(wrapper.offsetHeight))

      // canvas.setAttribute('width', 'inherit');
      // canvas.setAttribute('height', 'inherit');
      //获得 2d 上下文对象
      try {
        this.ctx = canvas.getContext('2d')
      } catch (e) {
        console.error('获取不到canvas画布')
      }

      this.initStyleProperties()
      this.initPushAction()
    } else {
      console.error(`获取不到canvas画布, canvasId:${canvasId}`)
    }
  }

  private getSetUpperName(name) {
    return `set${upperFirstChar(name)}`
  }

  initStyleProperties() {
    styleProperties.forEach((property) => {
      this[this.getSetUpperName(property)] = (value) => {
        this.actions.push({
          action: property,
          value,
          id: randomUuid()
        })
      }
    })
  }

  initPushAction() {
    toolsProperties.forEach((action) => {
      if (action !== 'draw') {
        this[action] = (...args) => {
          this.actions.push({
            action,
            args,
            id: randomUuid()
          })
        }
      }
    })
  }

  setFontSize(fontSize: number = 12) {
    this.actions.push({
      action: 'setFontSize',
      value: fontSize,
      id: randomUuid()
    })
  }

  /**
   * @param args
   * imageResource: string, x: number, y: number, width: number = 200, height: number = 200
   */
  drawImage(...args) {
    this.actions.push({
      action: 'drawImage',
      args,
      id: randomUuid()
    })
  }

  set font(value) {
    if (value) {
      this.ctx.font = value
    } else {
      console.error('缺省 font value')
    }
  }

  createCircularGradient(x: number, y: number, r: number) {
    return this.ctx.createRadialGradient(x, y, 0, x, y, r)
  }

  createLinearGradient(x0: number, y0: number, x1: number, y1: number) {
    return this.ctx.createLinearGradient(x0, y0, x1, y1)
  }

  async createPattern(imageResource: string, repeat: CreatePatternRepeatType) {
    const image: CanvasImageSource = await getImage(imageResource)
    const grd = this.ctx.createPattern(image, repeat)
    return grd
  }

  measureText(text: string) {
    return this.ctx.measureText(text)
  }

  parseDrawActions() {
    return this.actions.map((action) => {
      if (action.value instanceof Promise) {
        return action.value
      } else {
        return Promise.resolve(action.value)
      }
    })
  }

  addActionsMark() {
    let reserve = true
    for (let i = this.drawActionGroup.length - 1; i >= 0; i--) {
      const item = this.drawActionGroup[i]
      if (i === this.drawActionGroup.length - 1) {
        item.group.forEach((item) => {
          item.reserve = true
        })
      } else {
        item.group.forEach((item) => {
          item.reserve = reserve
        })
      }
      // reserve = reserve && item.reserve;
      // 处理最后一个draw
      if (
        i === this.drawActionGroup.length - 1 &&
        item.group.length === this.drawActionGroup[i].group.length
      ) {
        reserve = true
      } else {
        reserve = reserve && item.reserve
      }
    }
  }

  createDrawActionGroup(reserve) {
    this.drawActionGroup.push({
      action: 'draw',
      reserve,
      group: [...this.actions]
    })
  }

  draw(reserve, callback) {
    if (!reserve && this.actions.length) {
      this.clear()
    }
    this.createDrawActionGroup(reserve)
    this.addActionsMark()
    Promise.all(this.parseDrawActions()).then(async (data) => {
      this.actions.forEach(async (item, index) => {
        switch (item.action) {
          // case 'scale':
          //   const [sw = 1, sh = 1] = item.args || [];
          //   // 特殊处理逻辑
          //   this.ctx.scale(sw/this.devicePixelRatio, sh/this.devicePixelRatio);
          //   break;
          case 'setFontSize':
            this._setFontSize(item)
            break
          case 'drawImage':
            this._drawImage(item)
            break
          case 'setShadow':
            this._setShadow(...item.args)
            break
          case 'draw':
            break
          default:
            if (item.reserve) {
              this.toDrawActions(item, data, index)
            }
        }
      })
      if (callback) {
        callback()
      }
      this.clearActions()
    })
  }

  private toDrawActions(item, data, index) {
    if (item.args) {
      if (item.action === 'drawImage') {
        this._drawImage(item)
      } else {
        this.ctx[item.action](...item.args)
      }
    } else if (item.value) {
      this.ctx[item.action] = data[index]
    }
  }

  private async _drawImage(item) {
    const image: CanvasImageSource = await getImage(item.args[0])
    const x = item.args[1] || 0
    const y = item.args[2] || 0
    this.ctx.drawImage(image, x, y)
  }

  private _setFontSize(item) {
    this.ctx.font = `${item.value}px sans-serif`
  }

  private _setShadow(
    offsetX: number = 0,
    offsetY: number = 0,
    blur: number = 0,
    color: string = '#000000'
  ) {
    this.ctx.shadowOffsetX = offsetX
    this.ctx.shadowOffsetY = offsetY
    this.ctx.shadowBlur = blur
    this.ctx.shadowColor = color
  }

  clearActions() {
    setTimeout(() => {
      this.drawActionGroup = []
      this.actions = []
    }, 0)
  }

  clear() {
    const w = this.canvasWidth.replace(/px/, '')
    const h = this.canvasHeight.replace(/px/, '')
    this.ctx.clearRect(0, 0, +w, +h)
    this.clearCtxStyle()
  }

  clearCtxStyle() {
    this._setShadow()
    styleProperties.forEach((property) => {
      this[property] = stylePropertyMap[property]
    })
  }

  /* style

  setStrokeStyle(color: string) {
    this.ctx.strokeStyle = color;
  }

  setFillStyle(color: string | CanvasPattern) {
    this.ctx.fillStyle = color;
  }

  setGlobalAlpha(alpha: number) {
    this.ctx.globalAlpha = alpha;
  }

  setLineWidth(lineWidth: number = 1) {
    this.ctx.lineWidth = lineWidth;
  }

  setLineCap(lineCap: LineCapType) {
    this.ctx.lineCap = lineCap;
  }

  setLineJoin(lineJoin: LineJoinType) {
    this.ctx.lineJoin = lineJoin;
  }

  setMiterLimit(miterLimit: number) {
    this.ctx.miterLimit = miterLimit;
  }

  */

  /* action

  clip() {
    this.ctx.clip();
  }

  fill() {
    this.ctx.fill()
  }

  rect(x: number, y: number, width: number, height: number) {
    this.ctx.rect(x, y, width, height);
  }

  stroke() {
    this.ctx.stroke();
  }

  scale(scaleWidth: number, scaleHeight: number) {
    this.ctx.scale(scaleWidth, scaleHeight)
  }

  rotate(angle: number) {
    this.ctx.rotate(angle);
  }

  // 保存当前环境的状态
  save() {
    this.ctx.save();
  }

  // 返回之前保存过的路径状态和属性
  restore() {
    this.ctx.restore();
  }

  clearRect(x: number, y: number, width: number, height: number) {
    this.ctx.clearRect(x, y, width, height);
  }

  fillText(text: string, x: number, y: number) {
    this.ctx.fillText(text, x, y);
  }

  moveTo(x: number, y: number) {
    this.ctx.moveTo(x, y);
  }

  lineTo(x: number, y: number) {
    this.ctx.lineTo(x, y);
  }

  arc(x: number, y: number, r: number, sAngle: number, eAngle: number, counterclockwise: boolean) {
    this.ctx.arc(x,y,r,sAngle,eAngle,counterclockwise);
  }

  beginPath() {
    this.ctx.beginPath();
  }

  closePath() {
    this.ctx.closePath();
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
    this.ctx.quadraticCurveTo(cpx,cpy,x,y);
  }

  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) {
    this.ctx.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,x,y);
  }

  setLineDash(segments: number[]) {
    this.ctx.setLineDash(segments);
  }

  */
}
