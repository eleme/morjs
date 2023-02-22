import { css, unsafeCSS } from 'lit-element'
import { rpxToRem } from '../../rpx'

export const Styles = css`
  .header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: auto;
    z-index: 99999999;
    border-bottom: 0.5px solid transparent;
  }

  .header .title {
    display: flex;
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    align-items: center;
    font-size: ${unsafeCSS(rpxToRem(36))};
    padding: 0 ${unsafeCSS(rpxToRem(24))};
  }

  tiga-back {
    position: absolute;
    left: 0px;
  }

  .header .title--center {
    justify-content: center;
  }

  .header .title-back-padding {
    padding-left: 48px;
  }

  .header-placeholder {
    text-align: center;
    color: #1890ff;
  }

  .header-image {
    max-width: ${unsafeCSS(rpxToRem(240))};
    max-height: ${unsafeCSS(rpxToRem(72))};
    vertical-align: middle;
    border-style: none;
  }

  .icon-loading {
    display: inline-block;
    padding-left: 10px;
    color: inherit;
  }

  .loading-svg {
    animation: loadingCircle 1s infinite linear;
  }

  @keyframes loadingCircle {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`
