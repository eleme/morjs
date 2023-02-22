import { css, unsafeCSS } from 'lit-element'
import { rpxToRem } from '../../../../rpx'
import {
  CONTENT_HEIGHT,
  HEADER_HEIGHT,
  INDICATOR_TOP,
  ITEM_HEIGHT
} from './constants'

export const ModalStyles = css`
  .modal-container {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1000;
    transform: translateZ(1px);
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    display: none;
  }

  .modal-container--show {
    display: block;
  }

  .modal-mask {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 1;
    background-color: rgba(0, 0, 0, 0.2);
  }

  .modal-main {
    position: absolute;
    width: 100%;
    background-color: #fff;
    z-index: 2;
  }

  .modal-main--ios {
    right: 0;
    bottom: 0;
    left: 0;
  }

  .modal-main--android {
    top: 50%;
    left: 50%;
    width: ${unsafeCSS(rpxToRem(270 * 2))};
    transform: translate(-50%, -50%);
    border-radius: 7px;
  }

  .modal-main-header {
    position: relative;
    z-index: 4;
    background-image: linear-gradient(180deg, #e7e7e7, #e7e7e7, #fff, #fff);
    background-position: bottom;
    background-size: 100% 1px;
    background-repeat: no-repeat;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;
    height: ${unsafeCSS(rpxToRem(HEADER_HEIGHT))};
  }

  .modal-main--android .modal-main-header {
    margin: 0 12px;
  }

  .modal-btn {
    color: #108ee9;
    font-size: 17px;
    padding: 9px 15px;
    margin: 0;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-title {
    flex: 1;
    text-align: center;
    color: #000;
    font-size: 17px;
    margin: 0;
    padding: 0;
  }

  .modal-main--android .modal-title {
    text-align: left;
  }

  .modal-main-content {
    height: ${unsafeCSS(rpxToRem(CONTENT_HEIGHT))};
    position: relative;
    overflow: hidden;
    width: 100%;
  }

  .modal-main--android .modal-main-content {
    height: ${unsafeCSS(rpxToRem((CONTENT_HEIGHT / 3) * 2))};
  }

  .modal-main--android .modal-main-content {
    width: 85%;
    margin: 0 auto;
    padding: 2px 0;
  }

  .modal-content-indicator {
    position: absolute;
    left: 0;
    width: 100%;
    box-sizing: border-box;
    height: ${unsafeCSS(rpxToRem(ITEM_HEIGHT))};
    top: ${unsafeCSS(rpxToRem(INDICATOR_TOP))};
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    z-index: 3;
  }

  .modal-main--android .modal-content-indicator {
    top: ${unsafeCSS(rpxToRem((INDICATOR_TOP / 3) * 2))};
  }

  .modal-content-list {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    z-index: 1;
    padding: ${unsafeCSS(rpxToRem(INDICATOR_TOP))} 0;
    transform: translate3d(0px, 0px, 0px);
    -webkit-overflow-scrolling: touch;
  }

  .modal-main--android .modal-content-list {
    padding: ${unsafeCSS(rpxToRem((INDICATOR_TOP / 3) * 2))} 0;
  }

  .modal-content-item {
    touch-action: manipulation;
    text-align: center;
    font-size: 16px;
    height: ${unsafeCSS(rpxToRem(ITEM_HEIGHT))};
    line-height: ${unsafeCSS(rpxToRem(ITEM_HEIGHT))};
    color: #000;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .modal-content-mask {
    position: absolute;
    left: 0;
    top: 0px;
    bottom: -1px;
    width: 100%;
    z-index: 3;
    margin: 0 auto;
    background-image: linear-gradient(
        180deg,
        hsla(0, 0%, 100%, 0.95),
        hsla(0, 0%, 100%, 0.6)
      ),
      linear-gradient(0deg, hsla(0, 0%, 100%, 0.95), hsla(0, 0%, 100%, 0.6));
    background-position: top, bottom;
    background-size: 100% ${unsafeCSS(rpxToRem(INDICATOR_TOP))};
    background-repeat: no-repeat;
  }

  .modal-main--android .modal-content-mask {
    background-size: 100%
      ${unsafeCSS(rpxToRem(CONTENT_HEIGHT / 3 - ITEM_HEIGHT / 2))};
  }

  .modal-footer-group {
    margin: 16px 12px;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: flex-end;
  }

  .modal-btn-android {
    position: relative;
    color: #108ee9;
    font-size: 17px;
    margin: 0;
  }

  .modal-btn-android:last-child {
    margin-left: 16px;
  }

  .modal-btn-android::after {
    content: '';
    position: absolute;
    top: -10px;
    right: -10px;
    bottom: -10px;
    left: -10px;
  }
`
