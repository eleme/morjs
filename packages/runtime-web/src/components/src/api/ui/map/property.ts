import { getPropertiesByAttributes } from '../../../utils'

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
  AMAP_STYLE
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
  AMAP_VERSION: 'amap-version',
  AMAP_STYLE: 'amap-style'
}

export const properties: Properties = getPropertiesByAttributes(
  Object.keys(attributes)
)
