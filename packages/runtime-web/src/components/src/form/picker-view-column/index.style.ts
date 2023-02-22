import { css, unsafeCSS } from 'lit-element'
import { rpxToRem } from '../../rpx'
import { ITEM_HEIGHT } from './constants'

// item 的默认样式
export const DEFAULT_ITEM_STYLES = `
  display: block;
  text-align: center;
`

export const Styles = css`
  :host > section > div {
    position: absolute;
    left: 0;
    right: 0;
    height: ${unsafeCSS(rpxToRem(ITEM_HEIGHT))};
    box-sizing: border-box;
  }

  :host > section > p {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
    margin: 0;
    background-image: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.95),
        rgba(255, 255, 255, 0.6)
      ),
      linear-gradient(
        to top,
        rgba(255, 255, 255, 0.95),
        rgba(255, 255, 255, 0.6)
      );
    background-position: top, bottom;
    background-repeat: no-repeat;
  }

  .tiga-picker-column-container {
    position: relative;
    height: 100%;
    box-sizing: border-box;
    font-size: 16px;
  }

  .tiga-picker-column-indicator::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    border-top: 1px solid #e5e5e5;
  }

  .tiga-picker-column-indicator::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    border-top: 1px solid #e5e5e5;
  }
`
