import { css, html, property } from 'lit-element'
import { BaseElement } from '../../../baseElement'
import { defineElement } from '../../../utils'

class Loading extends BaseElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 100vw;
        z-index: 999999999999;
        justify-content: center;
        align-items: center;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      .host {
        border-radius: 5px;
        padding: 20px;
        min-width: 60px;
        color: #fff;
        background-color: rgba(58, 58, 58, 0.9);
        line-height: 1.5;
      }

      .circle {
        border: 2px solid rgba(200, 200, 200, 0.5);
        border-radius: 50%;
        position: relative;
        width: 0;
        height: 0;
        padding: 18px;
        margin: auto;
      }

      .circle::after {
        content: '';
        display: block;
        border-radius: 50%;
        width: 100%;
        height: 100%;
        position: absolute;
        top: -2px;
        left: -2px;
        border: 2px solid;
        border-color: rgba(58, 58, 58, 0.9);
        border-left-color: #fff;
        border-top-color: #fff;
        animation: circleRotateAnimation 1.2s infinite linear;
      }

      @keyframes circleRotateAnimation {
        0% {
          transform: rotateZ(0);
        }

        25% {
          transform: rotateZ(240deg);
        }

        50% {
          transform: rotateZ(480deg);
        }

        100% {
          transform: rotateZ(720deg);
        }
      }

      .loading-text {
        margin-top: 6px;
        color: #fff;
        line-height: 1.5;
      }
    `
  }

  @property({ type: String })
  content

  _handleClick() {
    this.dispatchEvent(new Event('close'))
  }

  render() {
    return html`
      <div class="host">
        <div class="circle"></div>
        <div class="loading-text">${this.content}</div>
      </div>
    `
  }
}

defineElement('private-loading', Loading)
