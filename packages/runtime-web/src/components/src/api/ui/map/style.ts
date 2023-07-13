import { css } from 'lit-element'

export default css`
  .tiga-map-container {
    height: inherit;
    overflow: hidden;
  }

  .icon-append-str {
    color: #33b276;
    font-size: 14px;
    font-weight: bold;
    text-shadow: 1px 1px 3px #fff;
  }

  .callout-wrap {
    position: relative;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #191919;
    border-radius: 40px;
    background: #fff;
    box-shadow: 0 16px 40px 0 rgba(0, 51, 65, 0.1);
  }

  .callout-layout-wrap {
    position: relative;
    box-shadow: 0 16px 40px 0 rgba(0, 51, 65, 0.1);
    display: flex;
  }

  .callout-layout-wrap-no-style {
    box-shadow: none;
  }

  .custom-content {
    width: max-content;
  }

  .callout-wrap-type-0 {
    background: rgba(51, 51, 51, 0.9);
    color: #fff;
  }

  .callout {
    display: flex;
    align-items: center;
    height: 40px;
    font-size: 16px;
    white-space: nowrap;
  }

  .callout-time {
    margin-right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #108ee9;
  }

  .callout-time-container {
    margin-right: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    line-height: 1;
  }

  .callout-time::after {
    display: block;
    content: '';
    width: 1px;
    height: 22px;
    background: #ccc;
  }

  .arrow {
    margin-left: 8px;
  }

  .inverted-triangle {
    position: absolute;
    left: calc(50% - 6px);
    bottom: -7px;
    width: 12px;
    height: 8px;
  }

  svg {
    display: block;
  }

  .vml {
    behavior: url(#default#VML);
    display: inline-block;
    position: absolute;
  }
  .amap-custom {
    top: 0;
    left: 0;
    position: absolute;
  }
  .amap-container img {
    max-width: none !important;
    max-height: none !important;
  }
  .amap-container {
    touch-action: none;
    position: relative;
    overflow: hidden;
    background: #fcf9f2
      url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0AgMAAAC2uDcZAAAADFBMVEX////////////////1pQ5zAAAABHRSTlMAgP/AWuZC2AAAAVhJREFUeAFiYGAQYGDEQjAB2rcDC4BiGIqiU7abdKlO2QkeIClyPsDHweMKtOPHIJ1Op6/w7Y4fdqfT6VpndzqdrnV2p9PpWmd3Oj3qWndSoKp+2J1Op7vr7E6n07XO7nQ6XevsTqfTtc7udPo4/f787E6n0911dqfT6VpndzqdrnV2p9PpWmd3Ot27Ce8m6HS6u85dR6fTtU7r6HS61mkdnU7XOrvT6XTvJuxOp9PddXan0+laZ3c6na51dDpd67SOTqd7N+HdBJ1Od9e56+h0utZpHZ1O1zq70+l0rbM7nU73bsLudDrdXWd3Ol3rtI5Op2ud1tHpdK3TOjqd7t2EdxN0Ot1dZ3c6na51dqfT6VpndzqdrnV2p9Pp3k3Q6XR3nbuOTqdrndbR6XSt0zo6na51Wken072bsDudTnfX2Z1Op2ud3el0utbZnU7XOq2j0+t0uncTD1gO4zoT5doZAAAAAElFTkSuQmCC);
    -ms-touch-action: none;
  }
  .amap-drags,
  .amap-layers {
    width: 100%;
    height: 100%;
    position: absolute;
    overflow: hidden;
  }
  .amap-layers canvas {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .amap-layer img {
    pointer-events: none;
  }
  .amap-e,
  .amap-maps {
    width: 100%;
    height: 100%;
  }
  .amap-maps,
  .amap-e,
  .amap-layers,
  .amap-tile,
  .amap-tile-container {
    position: absolute;
    left: 0;
    top: 0;
    overflow: hidden;
  }
  .amap-context {
    position: absolute;
    left: 0;
    top: 0;
  }
  .amap-overlays,
  .amap-markers,
  .amap-marker {
    position: absolute;
    left: 0;
    top: 0;
  }
  .amap-layers {
    z-index: 0;
  }
  .amap-overlays {
    z-index: 110;
    cursor: default;
  }

  .amap-markers {
    z-index: 120;
  }
  .amap-controls {
    z-index: 150;
  }
  .amap-copyright {
    position: absolute;
    display: block !important;
    left: 77px;
    height: 16px;
    bottom: 0;
    padding-bottom: 3px;
    font-size: 11px;
    font-family: Arial, sans-serif;
    z-index: 160;
  }
  .amap-logo {
    position: absolute;
    bottom: 1px;
    left: 1px;
    z-index: 160;
    height: 20px;
  }
  .amap-logo img {
    width: 73px !important;
    height: 20px !important;
    border: 0;
    vertical-align: baseline !important;
  }
  .amap-icon {
    position: relative;
    z-index: 1;
  }
  .amap-icon img {
    position: absolute;
    z-index: -1;
  }
  .amap-marker-label {
    position: absolute;
    z-index: 2;
    border: 1px solid blue;
    background-color: white;
    white-space: nowrap;
    cursor: default;
    padding: 3px;
    font-size: 12px;
    line-height: 14px;
  }
  .amap-info {
    position: absolute;
    left: 0;
    z-index: 140;
  }
  .amap-menu {
    position: absolute;
    z-index: 140;
    _width: 100px;
  }
  .amap-info-close {
    position: absolute;
    right: 5px;
    _right: 12px;
    +right: 11px;
    top: 5px;
    _top: 2px;
    +top: 2px;
    color: #c3c3c3;
    text-decoration: none;
    font: bold 16px/14px Tahoma, Verdana, sans-serif;
    width: 14px;
    height: 14px;
  }
  .amap-info-outer,
  .amap-menu-outer {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    background: none repeat scroll 0 0 white;
    border-radius: 2px;
    padding: 1px;
    text-align: left;
  }
  .amap-menu-outer:hover {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
  .amap-info-contentContainer:hover .amap-info-outer {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
  .amap-info-content {
    position: relative;
    background: #fff;
    padding: 10px 18px 10px 10px;
    line-height: 1.4;
    overflow: auto;
  }
  .amap-marker-content {
    position: relative;
  }
  .amap-info {
    _width: 320px;
  }
  .amap-menu {
    _width: 100px;
  }
  .amap-info-sharp-old {
    overflow: hidden;
    position: absolute;
    background-image: url(http://webapi.amap.com/images/arrows.png);
  }
  .bottom-center .amap-info-sharp-old {
    height: 12px;
    margin: 0 auto;
    width: 20px;
    background-position: center 12px;
    top: 100%;
    margin-top: -9px;
    left: 50%;
    margin-left: -10px;
  }
  .bottom-left .amap-info-sharp-old {
    height: 12px;
    width: 13px;
    background-position: -16px -46px;
    top: 100%;
    margin-top: -9px;
  }
  .bottom-right .amap-info-sharp-old {
    height: 12px;
    width: 13px;
    top: -1px;
    background-position: -56px -46px;
    left: 100%;
    margin-left: -13px;
    top: 100%;
    margin-top: -9px;
  }
  .middle-left .amap-info-sharp-old {
    height: 20px;
    width: 12px;
    background-position: left;
    top: 50%;
    margin-top: -10px;
    margin-left: -11px;
  }
  .center .amap-info-sharp-old {
    display: none;
  }
  .middle-right .amap-info-sharp-old {
    height: 20px;
    margin-right: 0;
    width: 12px;
    background-position: right;
    left: 100%;
    margin-left: -9px;
    top: 50%;
    margin-top: -10px;
  }
  .top-center .amap-info-sharp-old {
    height: 12px;
    margin: 0 auto;
    width: 20px;
    background-position: top;
    top: 0;
    margin-top: -3px;
    left: 50%;
    margin-left: -10px;
  }
  .top-left .amap-info-sharp-old {
    height: 12px;
    width: 13px;
    background-position: -16px -3px;
    top: 0;
    margin-top: -3px;
  }
  .top-right .amap-info-sharp-old {
    height: 12px;
    width: 13px;
    background-position: -56px -3px;
    left: 100%;
    margin-left: -13px;
    top: 0;
    margin-top: -3px;
  }
  .amap-info-sharp {
    position: absolute;
  }
  .bottom-center .amap-info-sharp {
    bottom: 0;
    left: 50%;
    margin-left: -8px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid #fff;
  }
  .bottom-center .amap-info-sharp:after {
    position: absolute;
    content: '';
    margin-left: -8px;
    margin-top: -7px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid rgba(0, 0, 0, 0.3);
    filter: blur(2px);
    z-index: -1;
  }
  .amap-info-contentContainer:hover.bottom-center .amap-info-sharp:after {
    border-top: 8px solid rgba(0, 0, 0, 0.5);
  }
  .bottom-left .amap-info-sharp {
    border-color: transparent #fff;
    border-width: 0 0 10px 10px;
    border-style: solid;
  }
  .bottom-left .amap-info-sharp:after {
    position: absolute;
    content: '';
    margin-left: -10px;
    border-color: transparent rgba(0, 0, 0, 0.3);
    border-width: 0 0 10px 10px;
    border-style: solid;
    filter: blur(1px);
    z-index: -1;
  }
  .amap-info-contentContainer:hover.bottom-left .amap-info-sharp:after {
    border-color: transparent rgba(0, 0, 0, 0.5);
  }
  .bottom-left .amap-info-content {
    border-radius: 2px 2px 2px 0;
  }
  .bottom-right .amap-info-sharp {
    right: 0;
    border-top: 10px solid #fff;
    border-left: 10px solid transparent;
  }
  .bottom-right .amap-info-sharp:after {
    position: absolute;
    margin-top: -9px;
    margin-left: -10px;
    content: '';
    border-top: 10px solid rgba(0, 0, 0, 0.3);
    border-left: 10px solid transparent;
    filter: blur(1px);
    z-index: -1;
  }
  .amap-info-contentContainer:hover.bottom-right .amap-info-sharp:after {
    border-top: 10px solid rgba(0, 0, 0, 0.5);
  }
  .bottom-right .amap-info-content {
    border-radius: 2px 2px 0 2px;
  }
  .top-center .amap-info-sharp {
    top: 0;
    left: 50%;
    margin-left: -8px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #fff;
  }
  .top-center .amap-info-sharp:after {
    position: absolute;
    content: '';
    margin-top: 0;
    margin-left: -8px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid rgba(0, 0, 0, 0.3);
    filter: blur(1px);
    z-index: -1;
  }
  .top-left .amap-info-sharp {
    left: 0;
    top: 0;
    border-bottom: 10px solid #fff;
    border-right: 10px solid transparent;
  }
  .top-left .amap-info-sharp:after {
    position: absolute;
    content: '';
    margin-top: 0;
    margin-left: 0;
    border-bottom: 10px solid rgba(0, 0, 0, 0.3);
    border-right: 10px solid transparent;
    filter: blur(1px);
    z-index: -1;
  }
  .top-right .amap-info-sharp {
    right: 0;
    top: 0;
    border-bottom: 10px solid #fff;
    border-left: 10px solid transparent;
  }
  .top-right .amap-info-sharp:after {
    position: absolute;
    content: '';
    margin-top: 0;
    margin-left: -10px;
    border-bottom: 10px solid rgba(0, 0, 0, 0.3);
    border-left: 10px solid transparent;
    filter: blur(1px);
    z-index: -1;
  }
  .middle-right .amap-info-sharp {
    right: 0;
    top: 50%;
    margin-top: -8px;
    border-top: 8px solid transparent;
    border-left: 8px solid #fff;
    border-bottom: 8px solid transparent;
  }
  .middle-right .amap-info-sharp:after {
    position: absolute;
    content: '';
    margin-top: -8px;
    margin-left: -8px;
    border-top: 8px solid transparent;
    border-left: 8px solid rgba(0, 0, 0, 0.3);
    border-bottom: 8px solid transparent;
    filter: blur(1px);
    z-index: -1;
  }
  .amap-info-contentContainer:hover.middle-right .amap-info-sharp:after {
    border-left: 8px solid rgba(0, 0, 0, 0.5);
  }
  .middle-left .amap-info-sharp {
    left: 0;
    top: 50%;
    margin-top: -8px;
    border-top: 8px solid transparent;
    border-right: 8px solid #fff;
    border-bottom: 8px solid transparent;
  }
  .middle-left .amap-info-sharp:after {
    position: absolute;
    content: '';
    margin-top: -8px;
    margin-left: 0;
    border-top: 8px solid transparent;
    border-right: 8px solid rgba(0, 0, 0, 0.3);
    border-bottom: 8px solid transparent;
    filter: blur(1px);
    z-index: -1;
  }
  .amap-info-contentContainer:hover.middle-left .amap-info-sharp:after {
    border-right: 8px solid rgba(0, 0, 0, 0.5);
  }
  .amap-info-contentContainer.top-left,
  .amap-info-contentContainer.top-center,
  .amap-info-contentContainer.top-right {
    padding-top: 8px;
  }
  .amap-info-contentContainer.bottom-left,
  .amap-info-contentContainer.bottom-center,
  .amap-info-contentContainer.bottom-right {
    padding-bottom: 8px;
  }
  .amap-info-contentContainer.middle-right {
    padding-right: 8px;
  }
  .amap-info-contentContainer.middle-left {
    padding-left: 8px;
  }
  .amap-menu-outer {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }
  ul.amap-menu-outer li {
    cursor: pointer;
    height: 35px;
    line-height: 35px;
    word-break: break-all;
    padding: 0 10px;
    font-size: 12px;
    white-space: nowrap;
  }
  ul.amap-menu-outer li a {
    text-decoration: none;
    font-size: 13px;
    margin: 0 5px;
    color: #000;
    padding: 5px 5px;
  }
  ul.amap-menu-outer li:hover {
    background-color: #f3f3ee;
  }
  .amap-overlay-text-container {
    display: block;
    width: auto;
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: #fff;
    padding: 2px 3px;
    border: 1px solid #ccc;
    border-radius: 3px;
  }
  .amap-overlay-text-container.amap-overlay-text-empty {
    display: none;
  }
  .amap-info-content-ie8 {
    border: 1px solid #9c9c9c;
  }

  .amap-scalecontrol {
    position: absolute;
    z-index: 150;
  }
  .amap-scale-text {
    text-align: center;
    font-size: 10px;
  }
  .amap-scale-line {
    position: relative;
    height: 8px;
  }
  .amap-scale-line div {
    -webkit-box-sizing: content-box !important;
    -moz-box-sizing: content-box !important;
    box-sizing: content-box !important;
  }
  .amap-scale-edgeleft,
  .amap-scale-middle,
  .amap-scale-edgeright {
    position: absolute;
    background-color: #333;
    overflow: hidden;
  }
  .amap-scale-edgeleft,
  .amap-scale-edgeright {
    width: 1px;
    _width: 3px;
    height: 6px;
    _height: 8px;
    border: solid 1px #fff;
  }
  .amap-scale-middle {
    height: 2px;
    _height: 4px;
    left: 2px;
    top: 2px;
    border-top: solid 1px #fff;
    border-bottom: solid 1px #fff;
  }
  .amap-geolocation-con .amap-geo {
    background: #fff
      url(https://webapi.amap.com/theme/v1.3/markers/b/loc_gray.png) 50% 50%
      no-repeat;
    width: 35px;
    height: 35px;
    border: 1px solid #ccc;
    border-radius: 3px;
    right: 4px;
  }
  .amap-locate-loading .amap-geo {
    background-image: url(https://webapi.amap.com/theme/v1.3/loading.gif);
  }
  .amap-locate {
    position: absolute;
    width: 18px;
    height: 18px;
    background: url(https://webapi.amap.com/theme/v1.3/map_view.png);
    _background: url(https://webapi.amap.com/theme/v1.3/map_view.gif);
    background-position: -130px -185px;
    cursor: pointer;
  }
`

export function handleStyleText(styleObject) {
  return Object.keys(styleObject || {}).reduce((acc, cur) => {
    return `${cur}:${(styleObject || {})[cur]};${acc}`
  }, '')
}

export function collectStyleObject(self, name, value) {
  self.styleObject = {
    ...self.styleObject,
    [name]: value
  }
}

export const onCommonStyleChange = (self, name, value = 0) => {
  const attributes = self.parentNode?.attributes || {}
  const layout = attributes.layout?.value

  if (
    self.nodeName !== 'TIGA-MAP-BOX' &&
    layout !== 'horizontal' &&
    layout !== 'vertical' &&
    (self.styleObject || {}).position !== 'absolute'
  ) {
    const { top, right, bottom, left } = self.styleObject || {}
    const horizontalAlign = attributes['horizontal-align']
    const verticalAlign = attributes['vertical-align']

    collectStyleObject(self, 'position', 'absolute')
    collectStyleObject(self, 'left', left || 0)
    collectStyleObject(self, 'right', right || left || 0)
    collectStyleObject(self, 'top', top || 0)
    collectStyleObject(self, 'bottom', bottom || top || 0)

    if (horizontalAlign || verticalAlign)
      collectStyleObject(self, 'margin', 'auto')
  }

  switch (name) {
    case 'width':
    case 'height':
    case 'padding':
    case 'padding-left':
    case 'padding-top':
    case 'padding-right':
    case 'padding-bottom':
    case 'border-radius':
    case 'border-width':
      collectStyleObject(self, name, `${value}px`)
      break
    case 'left':
    case 'top':
    case 'right':
    case 'bottom':
      if (layout === 'horizontal' || layout === 'vertical') {
        collectStyleObject(self, `margin-${name}`, `${value}px`)
      } else {
        collectStyleObject(self, name, `${value}px`)
      }
      break
    case 'border-color':
      collectStyleObject(self, 'border-style', 'solid')
      collectStyleObject(self, name, value)
      break
    case 'background-color':
      collectStyleObject(self, name, value || '#000000')
      break
  }
}
