import { css, html, property } from 'lit-element'
import { classMap } from 'lit-html/directives/class-map'
import { styleMap } from 'lit-html/directives/style-map'
import { BaseElement } from '../baseElement'
import { defineElement } from '../utils'

export default class TabbarItem extends BaseElement {
  badgeStyle = null
  dotStyle = null

  constructor() {
    super()

    this.badgeStyle = {
      position: 'absolute',
      top: '-2px',
      right: '-13px'
    }

    this.dotStyle = {
      position: 'absolute',
      top: '0',
      right: '-6px'
    }
  }

  static get styles() {
    return css`
      :host {
        display: block;
        flex: 1;
        padding-top: 8px;
        padding-left: 0;
        padding-right: 0;
        font-size: 0;
        color: rgba(0, 0, 0, 0.5);
        text-align: center;
      }

      :host:first-child {
        padding-left: env(safe-area-inset-left);
      }

      .tiga-tabbar__item__active .tiga-tabbar__label {
        color: #49a9ee;
      }

      .tiga-tabbar__icon {
        display: inline-block;
        width: 28px;
        height: 28px;
        margin-bottom: 2px;
      }

      .tiga-badge {
        display: inline-block;
        padding: 0.15em 0.4em;
        min-width: 8px;
        border-radius: 18px;
        background-color: #fa5151;
        color: #fff;
        line-height: 1.2;
        text-align: center;
        font-size: 12px;
        vertical-align: middle;
      }

      .tiga-badge_dot {
        padding: 0.4em;
        min-width: 0;
      }

      .tiga-tabbar__label {
        color: rgba(0, 0, 0, 0.9);
        font-size: 10px;
        line-height: 1.4;
      }

      p {
        padding: 0;
        margin: 0;
      }
    `
  }

  @property() key = null
  @property({ type: Boolean }) isSelected = false
  @property() text = ''
  @property() icon = ''
  @property() badgeText = ''
  @property() showRedDot = ''
  @property() textColor = ''
  @property() disableSafeAreaPadding = false

  handleClick() {
    const event = new CustomEvent('onSelect', {
      detail: {
        value: this.key
      },
      bubbles: true
    })
    this.dispatchEvent(event)
  }

  render() {
    const tigaTabbarCls = {
      'tiga-tabbar__item': true,
      'tiga-tabbar__item__active': this.isSelected
    }
    const hostStyles = this.disableSafeAreaPadding
      ? `padding-bottom: 8px;`
      : `padding-bottom: calc(8px + constant(safe-area-inset-bottom));
      padding-bottom: calc(8px + env(safe-area-inset-bottom));`

    return html`
      <style>
        :host{
          ${hostStyles};
        }
      </style>
      <div
        key="${this.key}"
        class=${classMap(tigaTabbarCls)}
        @click="${this.handleClick}"
      >
        <div
          style=${styleMap({ display: 'inline-block', position: 'relative' })}
        >
          ${this.icon
            ? html`<img src="${this.icon}" alt="" class="tiga-tabbar__icon" />`
            : ''}
          ${this.badgeText
            ? html` <span class="tiga-badge" style=${styleMap(this.badgeStyle)}>
                ${this.badgeText}
              </span>`
            : null}
          ${this.showRedDot
            ? html` <span
                class="tiga-badge tiga-badge_dot"
                style=${styleMap(this.dotStyle)}
              />`
            : null}
        </div>
        <p
          class="tiga-tabbar__label"
          style=${styleMap({ color: this.textColor || '' })}
        >
          ${this.text}
        </p>
      </div>
    `
  }
}

defineElement('tiga-tabbar-item', TabbarItem)
