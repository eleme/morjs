import { css, unsafeCSS } from 'lit-element'
import { rpxToRem } from '../../../rpx'

const rpx2Rem = (val) => {
  return unsafeCSS(rpxToRem(val))
}

export const Styles = css`
  :host { 
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 99999999;
    color: #333;
  }
  
  .choose-city {
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: column;
    height: 100vh;
    background: #f5f5f5;
  }
  
  .choose-title {
    width: 100%;
    height: ${rpx2Rem(80)};
    line-height: ${rpx2Rem(80)};
    text-align: center;
    font-weight: bold;
  }
  
  .close-wrap {
    position: absolute;
    right: 0;
    top: 0;
    align-self: flex-end;
    padding: ${rpx2Rem(24)};
  }
  
  .close {
    display: block;
    width: ${rpx2Rem(32)};
    height: ${rpx2Rem(32)};
  }
  
  .search-city {
    position: relative;
    margin: ${rpx2Rem(24)};
  }
  
  .search-icon {
    position: absolute;
    left: ${rpx2Rem(24)};
    top: 0;
    bottom: 0;
    margin: auto 0;
    height: 100%;
  }
  
  .search-city-input {
    padding: 0 ${rpx2Rem(24)} 0 ${rpx2Rem(60)};
    width: ${rpx2Rem(702)};
    font-size: ${rpx2Rem(28)};
    border-radius: ${rpx2Rem(8)};
    box-sizing: border-box;
  }
  
  .search-city-list {
    padding: 0 ${rpx2Rem(24)};
    background: #fff;
    user-select: none;
  }
  
  .no-search-city-list {
    margin-top: ${rpx2Rem(200)};
    text-align: center;
  }
  
  .choose-city-content {
    width: 100%;
    position: relative;
    overflow-y: scroll;
  }
  
  .choose-navigation {
    position: fixed;
    z-index: 1;
    top: ${rpx2Rem(120)};
    right: ${rpx2Rem(10)};
    color: rgb(16, 142, 233);
    font-size: ${rpx2Rem(28)}
    user-select: none;
  }
  
  .navigation-cell {
    text-align: center;
    font-weight: 500;
  }
  
  .hot-city {
    padding: 0 ${rpx2Rem(24)} 0 ${rpx2Rem(24)};
    padding-bottom: ${rpx2Rem(24)};
  }
  
  .hot-city__title {
    padding: ${rpx2Rem(40)} 0 ${rpx2Rem(16)};
    font-size: ${rpx2Rem(28)};
  }
  
  .hot-city__list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    user-select: none;
  }
  
  .hot-city__cell {
    margin-top: ${rpx2Rem(24)};
    // margin-right: ${rpx2Rem(24)};
    padding: ${rpx2Rem(8)} 0;
    flex-shrink: 0;
    width: ${rpx2Rem(200)};
    text-align: center;
    font-size: ${rpx2Rem(28)};
    background: #fff;
    border-radius: ${rpx2Rem(4)};
  }
  
  .city-list {
    flex: 1;
  }
  
  .city-list-title {
    padding: ${rpx2Rem(12)} ${rpx2Rem(24)};
    font-size: ${rpx2Rem(28)};
    color: #999
  }
  
  .city-list-cells {
    padding: 0 ${rpx2Rem(24)};
    background: #fff;
  }
  
  .city-list-cell:first-child {
    border-top: 0;
  }
  
  .city-list-cell {
    border-top: ${rpx2Rem(2)} solid #e2e2e2;
    padding: ${rpx2Rem(20)} 0;
  }
`
