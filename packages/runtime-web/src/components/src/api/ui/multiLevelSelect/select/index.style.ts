import { css, unsafeCSS } from 'lit-element'
import { rpxToRem } from '../../../../rpx'

export const Styles = css`
  p {
    margin: 0;
    padding: 0;
  }

  .select-header {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
  }

  .select-tab {
    width: ${unsafeCSS(rpxToRem(75 * 2))};
    height: ${unsafeCSS(rpxToRem(44 * 2))};
    line-height: ${unsafeCSS(rpxToRem(44 * 2))};

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    color: #111;
    font-size: 16px;
  }

  .select-tab-active {
    color: #1890ff;
    border-bottom: 2px solid #1890ff;
  }

  .select-list {
    max-height: ${unsafeCSS(rpxToRem(200 * 2))};
    overflow: auto;
    position: relative;
    background-color: #fff;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
  }

  .select-item {
    display: flex;
    align-items: center;
    flex-flow: row nowrap;
    margin-left: ${unsafeCSS(rpxToRem(15 * 2))};
    background-color: #fff;
    border-bottom: 1px solid #ddd;
    line-height: 1.5;
    font-size: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #111;
    height: ${unsafeCSS(rpxToRem(44 * 2))};
  }

  .select-item:last-child {
    border-bottom: none;
  }
`
