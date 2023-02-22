import { getPropertiesByAttributes } from '../utils'

interface KEY {
  LONGITUDE
  LATITUDE
  SCALE
  SKEW
  ROTATE
  MARKERS
  POLYLINE
  CIRCLES
  CONTROLS
  POLYGON
  SHOW_LOCATION
  INCLUDE_POINTS
  INCLUDE_PADDING
  GROUND_OVERLAYS
  TILE_OVERLAY
  CUSTOM_MAP_STYLE
  PANELS
  SETTING
  ID
  AMAP_KEY
  AMAP_SDK
  AMAP_VERSION
}

type Attributes = {
  [P in keyof KEY]?: string
}

type Properties = {
  [P in keyof KEY]?: symbol
}

export const attributes: Attributes = {
  LONGITUDE: 'longitude',
  LATITUDE: 'latitude',
  SCALE: 'scale',
  SKEW: 'skew',
  ROTATE: 'rotate',
  MARKERS: 'markers',
  POLYLINE: 'polyline',
  CIRCLES: 'circles',
  CONTROLS: 'controls',
  POLYGON: 'polygon',
  SHOW_LOCATION: 'show-location',
  INCLUDE_POINTS: 'include-points',
  INCLUDE_PADDING: 'include-padding',
  GROUND_OVERLAYS: 'ground-overlays',
  TILE_OVERLAY: 'tile-overlay',
  CUSTOM_MAP_STYLE: 'custom-map-style',
  PANELS: 'panels',
  SETTING: 'setting',
  ID: 'id',
  AMAP_KEY: 'amap-key',
  AMAP_SDK: 'amap-sdk',
  AMAP_VERSION: 'amap-version'
}

export const properties: Properties = getPropertiesByAttributes(
  Object.keys(attributes)
)

export function handleCssText(self, name, value) {
  self.cssText = self.cssText + `${name}: ${value};`
}

export const onCommonStyleChange = (self, name, value = 0) => {
  const layout = self.parentNode?.attributes?.layout?.value
  if (
    self.nodeName !== 'TIGA-MAP-BOX' &&
    layout !== 'horizontal' &&
    layout !== 'vertical' &&
    !/position(\s+)?:(\s+)?absolute/.test(self.cssText)
  ) {
    handleCssText(self, 'position', 'absolute')
    handleCssText(self, 'left', 0)
    handleCssText(self, 'top', 0)
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
      handleCssText(self, name, `${value}px`)
      break
    case 'left':
    case 'top':
    case 'right':
    case 'bottom':
      if (layout === 'horizontal' || layout === 'vertical') {
        handleCssText(self, `margin-${name}`, `${value}px`)
      } else {
        handleCssText(self, name, `${value}px`)
      }
      break
    case 'border-color':
      handleCssText(self, 'border', 'solid')
      break
    case 'background-color':
      handleCssText(self, name, value || '#000000')
      break
  }
}

export function uuid() {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
