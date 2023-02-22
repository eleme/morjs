import { css, unsafeCSS } from 'lit-element'
import { rpxToRem } from '../../../../rpx'

export const Styles = css`
  .private-sheet-wrap {
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

  .private-sheet-wrap p {
    margin: 0;
    padding: 0;
  }

  .private-sheet-mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    background-color: rgba(0, 0, 0, 0.4);
  }

  .private-sheet-main {
    position: absolute;
    z-index: 2;
    background-color: #fff;
  }

  .private-sheet-main--ios {
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    text-align: center;
  }

  .private-sheet-main--android {
    top: 50%;
    left: 50%;
    width: ${unsafeCSS(rpxToRem(270 * 2))};
    transform: translate(-50%, -50%);
    border-radius: 7px;
    text-align: left;
  }

  .private-sheet-title {
    color: #888;
    font-size: 14px;
    margin: ${unsafeCSS(rpxToRem(15 * 2))} auto;
    padding: 0 15px;
    text-align: center;
  }

  .private-sheet-list {
    max-height: ${unsafeCSS(rpxToRem(300 * 2))};
    overflow: scroll;
    text-align: center;
    color: #000;
  }

  .private-sheet-item {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    padding: 0 16px;
    margin: 0;
    position: relative;
    height: ${unsafeCSS(rpxToRem(50 * 2))};
    border-top: 1px solid #ddd;
    box-sizing: border-box;
    max-width: 100%;
  }

  .private-sheet-main--ios .private-sheet-item {
    justify-content: center;
  }

  .private-sheet-item p {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow-x: hidden;
  }

  .private-sheet-cancel {
    position: relative;
    padding-top: 6px;
    padding-bottom: 4px;
    border-top: none;
    box-sizing: content-box;
  }

  .private-sheet-cancel::before {
    content: '';
    position: absolute;
    z-index: 3;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    width: 100%;
    background-color: #e7e7ed;
  }

  .private-sheet-cancel::after {
    content: '';
    position: absolute;
    z-index: 3;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    width: 100%;
    background-color: #f5f5f9;
  }

  .private-sheet-badge-text,
  .private-sheet-badge-more,
  .private-sheet-badge-num {
    flex: 0 0 auto;
    display: inline-block;
    height: 18px;
    line-height: 18px;
    min-width: 9px;
    border-radius: 12px;
    padding: 0 5px;
    text-align: center;
    font-size: 12px;
    color: #fff;
    background-color: #ff5b05;
    white-space: nowrap;
    margin-left: 8px;
    box-sizing: content-box;
    white-space: nowrap;
  }

  .private-sheet-badge-more {
    line-height: 12px;
  }

  .private-sheet-badge-point {
    display: inline-block;
    margin-left: 8px;
    width: 8px;
    height: 8px;
    background-color: #ff5b05;
    border-radius: 8px;
  }
`
