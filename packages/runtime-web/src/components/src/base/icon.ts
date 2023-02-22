import { css, html, property } from 'lit-element'
import { BaseElement } from '../baseElement'

export default class Icon extends BaseElement {
  private ICON_TYPE = {
    SUCCESS: [
      'M65 130c-35.899 0-65-29.101-65-65S29.101 0 65 0s65 29.101 65 65-29.101 65-65 65zm28.749-84.5a1 1 0 0 0-.71.295L58.363 80.654l-13.75-13.651a1 1 0 0 0-.705-.29H32.752L58.362 93.7l44.886-48.2h-9.5z'
    ],
    INFO: [
      'M65 130c-35.899 0-65-29.101-65-65S29.101 0 65 0s65 29.101 65 65-29.101 65-65 65zM52.812 48.75v4.063h8.126V97.5h-8.126v4.063H81.25V97.5h-8.125V48.75H52.812zM65 40.625a8.125 8.125 0 1 0 0-16.25 8.125 8.125 0 0 0 0 16.25z'
    ],
    WARN: [
      'M65 130c-35.899 0-65-29.101-65-65S29.101 0 65 0s65 29.101 65 65-29.101 65-65 65zM60.521 29.25l.988 51.02a1 1 0 0 0 1 .98h6.066a1 1 0 0 0 1-.98l.967-50a1 1 0 0 0-1-1.02h-9.02zm5.02 70.417a5.958 5.958 0 1 0 0-11.917 5.958 5.958 0 0 0 0 11.917z'
    ],
    WAITING: [
      'M67.684 68.171L67.766 26h-6.36l-1.888 46.562-.092.19.083.04-.011.275h.586l30.94 14.76 2.544-4.406-25.884-15.25zM65 130c-35.899 0-65-29.101-65-65S29.101 0 65 0s65 29.101 65 65-29.101 65-65 65z'
    ],
    CLEAR: [
      'M65 130c-35.899 0-65-29.101-65-65S29.101 0 65 0s65 29.101 65 65-29.101 65-65 65zm9.692-65L90.83 48.863a6.846 6.846 0 0 0 .017-9.71c-2.696-2.695-7.024-2.668-9.71.017L65 55.308 48.863 39.17a6.846 6.846 0 0 0-9.71-.017c-2.695 2.696-2.668 7.024.017 9.71L55.308 65 39.17 81.137a6.846 6.846 0 0 0-.017 9.71c2.696 2.695 7.024 2.668 9.71-.017L65 74.692 81.137 90.83a6.846 6.846 0 0 0 9.71.017c2.695-2.696 2.668-7.024-.017-9.71L74.692 65z'
    ],
    SUCCESS_NO_CIRCLE: [
      'M112.132 0H130L47.227 88.884 0 39.118h20.92a1 1 0 0 1 .704.29l25.603 25.418L111.423.295a1 1 0 0 1 .709-.295z'
    ],
    DOWNLOAD: [
      'M65 11.818c-29.325 0-53.182 23.857-53.182 53.182 0 29.325 23.857 53.182 53.182 53.182 29.325 0 53.182-23.857 53.182-53.182 0-29.325-23.857-53.182-53.182-53.182M65 130c-35.84 0-65-29.16-65-65S29.16 0 65 0s65 29.16 65 65-29.16 65-65 65',
      'M59.728 75.224V35.909h11.819v39.315h13.212L65.335 94.649 45.909 75.224z'
    ],
    CANCEL: [
      'M65 130c-35.899 0-65-29.101-65-65S29.101 0 65 0s65 29.101 65 65-29.101 65-65 65zm19.446-89.77L64.76 59.919l-19.432-19.43-4.896 4.896 19.431 19.43-19.631 19.632 4.896 4.896L64.76 69.711l19.887 19.888 4.897-4.896-19.888-19.888 19.687-19.688-4.896-4.896z'
    ],
    SEARCH: [
      'M130 118.53l-11.364 11.468-31.138-31.32c-9.168 7.066-20.583 11.308-33.005 11.308C24.398 109.986 0 85.364 0 54.993 0 24.623 24.398 0 54.493 0c30.094 0 54.491 24.62 54.491 54.992 0 11.977-3.835 23.028-10.277 32.056L130 118.53zM54.493 13.334c-22.801 0-41.285 18.65-41.285 41.658 0 23.009 18.483 41.661 41.285 41.661 22.796 0 41.279-18.652 41.279-41.66 0-23.01-18.483-41.66-41.279-41.66z'
    ]
  }

  static get styles() {
    return css`
      .icon {
        width: 30px;
        height: 30px;
      }

      .a-icon-warn {
        fill: #e8a010;
      }
    `
  }

  /**
   * icon 类型，有效值： info、warn、waiting、cancel、download、search、clear、success、success_no_circle、loading。
   */
  @property({ type: String }) type = ''

  /**
   * icon 大小，单位 px。
   * 默认值：23
   */
  @property({ type: Number }) size = 23

  /**
   * icon 颜色，同 CSS 色值。
   */
  @property({ type: String }) color = '#1890ff'

  @property({ type: Array }) paths = []

  constructor() {
    super()
  }

  connectedCallback() {
    super.connectedCallback()
    setTimeout(() => {
      this.renderSvgIcon()
    }, 0)
  }

  renderSvgIcon() {
    if (this.type && this.ICON_TYPE[this.type.toUpperCase()]) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      svg.setAttribute('viewBox', '0 0 130 130')
      svg.setAttribute('class', 'icon')
      svg.setAttribute('style', `width: ${this.size}; height: ${this.size}`)
      svg.setAttribute('p-id', '27107')
      svg.setAttribute('version', '1.1')
      svg.setAttribute('width', '130')
      svg.setAttribute('height', '130')
      this.shadowRoot.appendChild(svg)

      this.ICON_TYPE[this.type.toUpperCase()].forEach((item) => {
        const r = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        r.setAttribute('fill', `${this.color}`)
        r.setAttribute('fill-rule', 'evenodd')
        r.setAttribute('d', item)
        svg.appendChild(r)
      })
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
  }

  render() {
    return html``
  }
}
