import { css, unsafeCSS } from 'lit-element'
import { rpxToRem } from '../../rpx'
import { INIT_HEIGHT } from './constants'

export const DEFAULT_CHILDREN_STYLES = `
flex: 1;
`

export const Styles = css`
  :host {
    height: ${unsafeCSS(rpxToRem(INIT_HEIGHT))};
    background-color: #efeff4;
    overflow: hidden;
  }

  :host > div {
    display: flex;
    flex-flow: row nowrap;
    position: relative;
    overflow: hidden;
    background-color: inherit;
    height: inherit;
  }
`
