import { css } from 'lit-element'

export const Styles = css`
  .private-toast {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 3px;
    color: #fff;
    z-index: 2147483647;
    background-color: rgba(58, 58, 58, 0.9);
    line-height: 1.5;
    font-size: 14px;
    padding: 9px 15px;
    box-sizing: border-box;
    text-align: center;
  }

  .private-toast p {
    margin: 0;
    padding: 0;
  }

  .private-toast #success,
  .private-toast #fail,
  .private-toast #dislike {
    width: 36px;
    height: 36px;
    text-align: center;
  }
`
