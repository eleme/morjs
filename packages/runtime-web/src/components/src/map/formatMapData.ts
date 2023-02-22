import { arrow, invertedTriangle } from './svg-icon'

const transformTigaTag = (str) => {
  if (typeof str !== 'string') return

  return str
    .replace(
      /(<(\s+)?(box|text|image)[^>]+)\/>/g,
      ($1, $2, $3, $4) => `${$2}></tiga-map-${$4}>`
    )
    .replace(/<(\s+)?\/(\s+)?box(\s+)?>/g, '</tiga-map-box>')
    .replace(/<(\s+)?(box|text|image)/g, ($1, $2, $3) => `<tiga-map-${$3}`)
}

function anchorToOffset(x, y, w, h) {
  if (x === undefined) {
    x = 0.5
  }
  if (y === undefined) {
    y = 1.0
  }
  if (w === undefined) {
    w = 20
  }
  if (h === undefined) {
    h = 34
  }
  return {
    x: -w * x,
    y: -h * y
  }
}

function marker(marker) {
  const {
    id,
    longitude,
    latitude,
    iconPath,
    title,
    width = 20,
    height = 34,
    rotate = 0,
    alpha = 1,
    anchorX,
    anchorY,
    iconAppendStr,
    iconAppendStrColor,
    iconLayout
  } = marker || {}

  const offset = anchorToOffset(anchorX, anchorY, width, height)

  const __handleEventCalloutTap = () => {
    this.dispatchEvent(
      new CustomEvent('markertap', {
        detail: {},
        bubbles: true,
        composed: true
      })
    )
  }

  function getContent() {
    if (iconLayout && iconLayout.data) {
      const { data } = iconLayout
      return {
        content: transformTigaTag(data),
        anchor: 'center'
      }
    }

    let content = ''
    if (iconPath) {
      content += `<img class="marker" src="${iconPath}" style="opacity:${alpha}; width:${width}px; height:${height}px" />`
    }

    if (iconAppendStr) {
      content += `<div class="icon-append-str" style="${
        iconAppendStrColor ? `color: ${iconAppendStrColor}` : ''
      }">${iconAppendStr}</div>`
    }

    return {
      content,
      offset: new window.AMap.Pixel(offset.x, offset.y)
    }
  }

  const markerInstance = new window.AMap.Marker({
    map: this.map,
    position: new window.AMap.LngLat(longitude, latitude),
    ...getContent(),
    title,
    angle: rotate,
    extData: {
      id: id || ''
    }
  })

  window.AMap.event.addListener(
    markerInstance,
    'click',
    __handleEventCalloutTap
  )

  return markerInstance
}

function callout(marker) {
  if (!marker) return

  const {
    customCallout,
    callout,
    width,
    height = 20,
    anchorX,
    anchorY,
    longitude,
    latitude
  } = marker

  const offset = anchorToOffset(anchorX, anchorY, width, height)

  const calloutWrap = (slot, type = 2) => {
    return `<div id="tiga-map-callout" class="callout-wrap ${
      type === 0 ? 'callout-wrap-type-0' : ''
    }">
        ${slot}
        <div class="arrow" style="display: ${
          type === 2 ? 'none' : 'block'
        }">${arrow('8px', '13.5px', type === 0 ? '#fff' : '#191919')}</div>
        <div class="inverted-triangle">${invertedTriangle(
          '12px',
          '8px',
          type === 0 ? 'rgba(51, 51, 51, 0.9)' : '#fff'
        )}</div>
      </div>`
  }

  if (customCallout && customCallout.isShow) {
    const { descList = [], type, time, layout } = customCallout
    const customCalloutContent = () => {
      return Array.isArray(descList)
        ? descList.reduce((acc, cur) => {
            const { descColor, desc } = cur
            return (
              desc && `${acc}<span style="color: ${descColor}">${desc}</span>`
            )
          }, '')
        : ''
    }
    const customCalloutTime = () => {
      if (!time || isNaN(time)) {
        return ''
      }
      return `<div class="callout-time">
        <div class="callout-time-container">
          <div>${time}</div>
          <div style="margin-top: 2px; font-size: 11px;">分钟</div>
        </div>
      </div>`
    }

    const getContent = () => {
      if (layout && layout.data) {
        return {
          content: `<div id="tiga-map-callout" class="callout-layout-wrap ${
            type === 0 ? 'callout-wrap-type-0' : ''
          }">${transformTigaTag(
            layout.data
          )}<div class="inverted-triangle">${invertedTriangle(
            '12px',
            '8px',
            type === 0 ? 'rgba(51, 51, 51, 0.9)' : '#fff'
          )}</div></div>`,
          offset: new window.AMap.Pixel(0, offset.y)
        }
      }

      return {
        content: calloutWrap(
          `<div class="callout">${customCalloutTime()}${customCalloutContent()}</div>`,
          type
        ),
        offset: new window.AMap.Pixel(0, offset.y)
      }
    }

    return {
      isCustom: true,
      ...getContent(),
      longitude,
      latitude
    }
  }

  if (callout && callout.content) {
    return {
      isCustom: true,
      offset: new window.AMap.Pixel(offset.x, offset.y),
      longitude,
      latitude,
      content: calloutWrap(`<div class="callout">${callout.content}</div>`)
    }
  }
}

export default {
  marker,
  callout
}
