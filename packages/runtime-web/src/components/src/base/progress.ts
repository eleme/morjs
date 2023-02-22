import { css, html, property } from 'lit-element'
import { classMap } from 'lit-html/directives/class-map'
import { styleMap } from 'lit-html/directives/style-map'
import { BaseElement } from '../baseElement'
import boolConverter from '../utils/bool-converter'

export default class Progress extends BaseElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      .line {
        width: 100%;
        height: 6px;
        display: flex;
        flex: 1;
        position: relative;
        background-color: #ddd;
        overflow: hidden;
      }

      .percent {
        position: absolute;
        top: 0;
        left: 0;
        width: 0%;
        height: 100%;
      }

      .bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }

      .percent-num {
        width: 40px;
        display: block;
        text-align: right;
      }

      span {
        white-space: pre-line;
      }

      .animation {
        animation: moveAnimation 1s infinite linear;
        animation-iteration-count: 1;
      }

      @keyframes moveAnimation {
        from {
          width: 0%;
        }
        to {
          width: 100%;
        }
      }
    `
  }

  /**
   * 显示百分比
   * 0~100
   */
  @property({ type: Number }) percent = 0;

  /**
   * 右侧显示百分比值
   * 默认值：show-info="{{false}}"
   */
  @property({ converter: boolConverter }) ['show-info'] = false;

  /**
   * 线的粗细，单位 px
   * 默认值：6
   */
  @property({ type: Number }) ['stroke-width'] = 6;

  /**
   * 进度条颜色
   * 默认值：#09BB07
   */
  @property({ type: String }) ['active-color'] = '#1890ff';

  /**
   * 未选择的进度条颜色。
   */
  @property({ type: String }) ['background-color'] = '#dddddd'

  /**
   * 是否添加从 0% 开始加载的入场动画。
   * 默认值：active="{{false}}"
   */

  @property({ converter: boolConverter }) active = false

  constructor() {
    super()
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
  }

  render() {
    return html`
      <div
        class="line"
        style=${styleMap({
          height: this['stroke-width'] + 'px',
          backgroundColor: this['background-color']
        })}
      >
        <div class="percent" style=${styleMap({ width: this.percent + '%' })}>
          <div
            class=${classMap({ bar: true, animation: this.active })}
            style=${styleMap({ backgroundColor: this['active-color'] })}
          ></div>
        </div>
      </div>
      ${this['show-info'] && this.percent
        ? html`<span class="percent-num">${this.percent}%</span>`
        : undefined}
    `
  }
}
