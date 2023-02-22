import { css, unsafeCSS } from 'lit-element'
import { rpxToRem } from '../../../../rpx'

export const Styles = css`
  .private-confirm-wrap {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    z-index: 1000;
    transform: translateZ(1px);
  }

  .private-confirm-wrap p {
    margin: 0;
    padding: 0;
  }

  .private-confirm-mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    background-color: rgba(0, 0, 0, 0.4);
  }

  .private-confirm-main {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: ${unsafeCSS(rpxToRem(270 * 2))};
    background-color: #fff;
    padding-top: 15px;
    border-radius: 7px;
    z-index: 2;
  }

  .private-confirm-title {
    padding: 6px 15px 15px;
    margin: 0;
    font-size: 18px;
    line-height: 1;
    color: #000;
    text-align: center;
  }

  .private-confirm-content {
    padding: 0 15px 15px;
    font-size: 15px;
    color: #888;
    height: 100%;
    line-height: 1.5;
    overflow: auto;
    word-break: break-word;
    text-align: center;
  }

  .private-confirm-footer {
    border-top: 1px solid #ddd;
    display: flex;
    flex-flow: row nowrap;
  }

  .private-confirm-footer p {
    margin: 0;
    padding: 0;
    font-size: 18px;
    height: ${unsafeCSS(rpxToRem(50 * 2))};
    text-align: center;
    flex: 1 1 50%;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center;
  }

  .private-confirm-ok {
    position: relative;
    color: rgb(16, 142, 233);
  }

  .private-confirm-ok::before {
    content: '';
    position: absolute;
    left: -0.5px;
    top: 0;
    height: 100%;
    width: 1px;
    background-color: #ddd;
  }
`
