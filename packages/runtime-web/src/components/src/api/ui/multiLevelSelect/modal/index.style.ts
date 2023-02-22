import { css, unsafeCSS } from 'lit-element'
import { rpxToRem } from '../../../../rpx'
import { CONTENT_HEIGHT, HEADER_HEIGHT } from './constants'

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
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
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

  .modal-main-close {
    position: absolute;
    width: 22px;
    height: 22px;
    top: 9px;
    right: 10px;
    font-size: 16px;
    color: #1890ff;
    margin: 0;
    padding: 0;
  }

  .modal-main-close::after {
    content: '';
    position: absolute;
    top: -5px;
    right: -5px;
    bottom: -5px;
    left: -5px;
  }

  .modal-main-content {
    height: ${unsafeCSS(rpxToRem(CONTENT_HEIGHT))};
    position: relative;
    overflow: hidden;
    width: 100%;
  }

  .modal-content-list {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    z-index: 1;
    padding: 0;
    transform: translate3d(0px, 0px, 0px);
    -webkit-overflow-scrolling: touch;
  }

  .modal-content-mask {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    z-index: 3;
    margin: 0 auto;
    background-color: #fff;
  }

  .modal-footer-group {
    margin: 16px 12px;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: flex-end;
  }

  .modal-btn-android:last-child {
    margin-left: 16px;
  }
`
