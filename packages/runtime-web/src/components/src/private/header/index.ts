import { html, LitElement, property } from 'lit-element'
import { defineElement, isIos, isPureWhite } from '../../utils'
import {
  BOOLEAN,
  COLOR,
  TRANSPARENT,
  TransparentHeaderDefaultOpacity
} from './constants'
import { Styles } from './index.style'
const converter = (defaultValue: any = '') => ({
  fromAttribute: (value: any) => {
    if (value === 'undefined' || value === 'null' || value === 'false')
      return defaultValue
    return value || defaultValue
  }
})

export default class Header extends LitElement {
  static get styles() {
    return Styles
  }

  @property({ type: String })
  ['default-title'] = '';

  @property({ converter: converter(TRANSPARENT.NONE) })
  ['transparent-title'];

  @property({ converter: converter() })
  ['title-image'];

  @property({ converter: converter() })
  ['border-bottom-color'];

  @property({ converter: converter(BOOLEAN.NO) })
  ['title-penetrate'];

  @property({ converter: converter(false) })
  ['show-back'];

  @property({ converter: converter(COLOR.WHITE) })
  ['title-bar-color'];

  @property({ converter: converter(TransparentHeaderDefaultOpacity) })
  ['header-opacity'];

  @property({ type: String })
  ['title-bar-height'];

  @property({ type: String })
  ['status-bar-height'];

  @property({ converter: converter(false) })
  ['header-loading']

  getHeaderConfig() {
    // 是否一直透明
    const isAlways = this['transparent-title'] === TRANSPARENT.ALWAYS
    const isAutoTransparentTitle =
      this['transparent-title'] === TRANSPARENT.AUTO
    let titleBarColor = this['title-bar-color'] || COLOR.WHITE
    // 为了和titleBarColor行成对比色
    let titleColor = isPureWhite(this['title-bar-color'])
      ? COLOR.BLACK
      : COLOR.WHITE
    const isDefaultOpacity =
      this['header-opacity'] === TransparentHeaderDefaultOpacity
    const isOpenPenetrate = this['title-penetrate'] === BOOLEAN.YES
    const transparentSettings = () => {
      titleBarColor = COLOR.TRANSPARENT
      titleColor = COLOR.WHITE
    }
    const titleBarHeight = this['title-bar-height']
    const statusBarHeight = this['status-bar-height']

    const styles = {
      titleBarHeight: `height:${titleBarHeight};`,
      titleBarLineHeight: `line-height:${titleBarHeight};`,
      statusBarHeight: `height:${statusBarHeight};`
    }

    if (isAlways || (isAutoTransparentTitle && isDefaultOpacity)) {
      // 透明头场景下固定背景色和文字颜色
      transparentSettings()
    }

    return {
      isAlways,
      isAutoTransparentTitle,
      titleBarColor,
      titleColor,
      isOpenPenetrate,
      isDefaultOpacity,
      styles
    }
  }

  private getHeaderLoadingRender() {
    return html`<i class="icon-loading">
      <svg
        viewBox="0 0 1024 1024"
        focusable="false"
        class="loading-svg"
        width="1em"
        height="1em"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 0 0-94.3-139.9 437.71 437.71 0 0 0-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"
        ></path>
      </svg>
    </i>`
  }

  render() {
    const config = this.getHeaderConfig()

    return html`
      <div
        class="header ${config.isAutoTransparentTitle ? COLOR.TRANSPARENT : ''}"
        style="
        ${config.isAutoTransparentTitle && !config.isDefaultOpacity
          ? `opacity: ${this['header-opacity']};`
          : ''}
        color:${config.titleColor};
        pointer-events: ${config.isOpenPenetrate ? 'none' : 'auto'};
        background-color:${config.titleBarColor};
        border-bottom-color:${this['border-bottom-color'] ||
        config.titleBarColor};"
      >
        <div style="${config.styles.statusBarHeight}"></div>
        <div
          class="title ${isIos()
            ? 'title--center'
            : this['show-back']
            ? 'title-back-padding'
            : ''}"
          style="${config.styles.titleBarHeight}${config.styles
            .titleBarLineHeight}"
        >
          ${this['show-back']
            ? html`<tiga-back color="${config.titleColor}"></tiga-back>`
            : ''}
          ${this['title-image']
            ? html`<img src="${this['title-image']}" class="header-image" />`
            : this['default-title']}
          ${this['header-loading'] ? this.getHeaderLoadingRender() : undefined}
        </div>
      </div>
      ${config.isAutoTransparentTitle || config.isAlways
        ? ''
        : html`
            <div>
              <div style="${config.styles.statusBarHeight}"></div>
              <div
                class="header-placeholder"
                style="${config.styles.titleBarHeight}${config.styles
                  .titleBarLineHeight}"
              ></div>
            </div>
          `}
    `
  }
}

defineElement('tiga-header', Header)
