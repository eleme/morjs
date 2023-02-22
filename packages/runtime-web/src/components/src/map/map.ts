import { html, property, query } from 'lit-element'
import get from 'lodash.get'
import { BaseElement } from '../baseElement'
import { uuid } from '../utils'
import addScript from '../utils/add-script'
import arrConverter from '../utils/array-converter'
import boolConverter from '../utils/bool-converter'
import objConverter from '../utils/object-converter'
import formatMapData from './formatMapData'
import initMapApi from './initMapApi'
import { attributes, properties } from './property'
import style from './style'

const MAP_SDK = 'https://webapi.amap.com/maps'
const MAP_VERSION = '1.4.15'

const cbs = []
function mapReady(callback) {
  if (typeof window.AMap !== 'undefined') {
    callback()
  } else {
    cbs.push(callback)
  }
}

export default class Map extends BaseElement {
  constructor() {
    super()

    if (typeof window.AMap === 'undefined') {
      // 尝试从 window 中读取 map 配置，用户可在 mor.config 给 map 传递 信息
      const mapConfig = get(window.$MOR_APP_CONFIG, 'components.map', {})
      const { key = '', version = MAP_VERSION, sdk = MAP_SDK } = mapConfig
      addScript({
        src: `${sdk}?v=${version}&key=${key}`,
        success: () => {
          for (let i = 0, l = cbs.length; i < l; i++) {
            cbs[i].call(this)
          }
        }
      })
    }

    this.initProperties()
  }

  initProperties() {
    this[properties.LONGITUDE] = 121.380733
    this[properties.LATITUDE] = 31.233395
    this[properties.SCALE] = 16
    this[properties.ROTATE] = 0
    this[properties.ID] = uuid()
  }

  connectedCallback() {
    super.connectedCallback()

    this.renderMap()
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)

    if (oldVal !== newVal && this.map) {
      if (name === 'longitude') {
        this.map.setCenter([newVal, this[properties.LATITUDE]])
      }

      if (name === 'latitude') {
        this.map.setCenter([this[properties.LONGITUDE], newVal])
      }

      if (name === 'scale') {
        this.map.setZoom(newVal)
      }

      if (name === 'markers') {
        ;(this.markers || []).map((marker) => marker.setMap(null))
        this.__handleFormatMarker(arrConverter.fromAttribute(newVal))
      }

      if (name === 'polyline') {
        ;(this.polyline || []).map((pl) => pl.setMap(null))
        this.__drawPolyline(arrConverter.fromAttribute(newVal))
      }

      if (name === 'includePoints') {
        ;(this.includePoints || []).map((ip) => ip.setMap(null))
        this.__drawIncludePoints(objConverter.fromAttribute(newVal))
      }
    }
  }

  __handleEventCalloutTap() {
    this.dispatchEvent(
      new CustomEvent('callouttap', {
        detail: {},
        bubbles: true,
        composed: true
      })
    )
  }

  __handleGetStyleSize(style, type) {
    let val
    style.replace(
      new RegExp(`${type}:\\s+?(\\d+\\.?\\d+)(px|rem|vh|vw)`, 'g'),
      ($1, $2, $3): string => {
        if ($3 === 'rem') {
          val = $2 * 16
          return
        }
        if ($3 === 'vh') {
          val = ($2 / 100) * document.documentElement.clientHeight
          return
        }
        if ($3 === 'vw') {
          val = ($2 / 100) * document.documentElement.clientWidth
          return
        }
        val = $2
      }
    )
    return Number(val)
  }

  __handleFormatMarker(markers) {
    const isInRange = (maker) => {
      const { displayRanges = [] } = maker
      return (
        !displayRanges ||
        !displayRanges.length ||
        displayRanges.find((item) => {
          return (
            this[properties.SCALE] <= item.to &&
            this[properties.SCALE] >= item.from
          )
        })
      )
    }

    this.markers = []
    for (let i = 0, l = markers.length; i < l; i++) {
      const range = isInRange(markers[i])
      if (range) {
        const marker = formatMapData.marker.bind(this)(markers[i])
        this.markers.push(marker)
      }
    }
    const getInfoWindowMarker = () => {
      const customCalloutMarker = markers.find((item) => {
        const { customCallout } = item
        const range = isInRange(item)
        return range && customCallout && customCallout.isShow
      })

      const calloutMarker = markers.find((item) => {
        const { callout } = item
        const range = isInRange(item)
        return range && callout && callout.content
      })

      return customCalloutMarker || calloutMarker
    }
    const infoWind = getInfoWindowMarker()
    if (infoWind) {
      const calloutTarget = formatMapData.callout.bind(this)(infoWind)
      const infoWindow = new window.AMap.InfoWindow(calloutTarget)
      infoWindow.open(
        this.map,
        new window.AMap.LngLat(calloutTarget.longitude, calloutTarget.latitude)
      )
      this.map.on('complete', () => {
        window.AMap.event.addDomListener(
          this.callout,
          'click',
          this.__handleEventCalloutTap
        )
      })
    }
  }

  getHexAlpha(color) {
    // wx: 8位十六进制表示，后两位表示alpha值
    if (color && color.length === 9) {
      const hexColor = color.substring(0, 7)
      const alpha = 1 - (255 - parseInt(color.substring(7, 9), 16)) / 255
      return {
        hex: hexColor,
        alpha
      }
    }
    return { hex: '#000000', alpha: 0 }
  }

  __drawPolyline(polyline) {
    this.polyline = []
    if (polyline && polyline.map) {
      polyline.forEach((item) => {
        const lineArr = item.points.map((point) => [
          point.longitude,
          point.latitude
        ])
        const mapPolyline = new window.AMap.Polyline({
          path: lineArr, // 设置线覆盖物路径
          strokeColor: this.getHexAlpha(item.color).hex, // 线颜色
          strokeOpacity: this.getHexAlpha(item.color).alpha, // 线透明度
          strokeWeight: item.width || 5, // 线宽
          strokeStyle: item.dottedLine ? 'dashed' : 'solid' // 线样式
        })
        mapPolyline.setMap(this.map)
        this.polyline.push(mapPolyline)
      })
    }
  }

  __drawIncludePoints(includePoints) {
    const { map } = this
    this.includePoints = []
    if (includePoints && includePoints.map) {
      const fitMarkersArr = includePoints.map((point) => {
        return new window.AMap.Circle({
          center: [point.longitude, point.latitude],
          map,
          radius: 1,
          strokeColor: 'red',
          strokeOpacity: 0,
          fillColor: 'red',
          fillOpacity: 0
        })
      })
      if (includePoints.length === 1) {
        const point = includePoints[0]
        map && map.setCenter([point.longitude, point.latitude])
      } else {
        map && map.setFitView(fitMarkersArr)
      }

      this.includePoints = fitMarkersArr
    }
  }

  __handleRemoveControl(query) {
    if (query === 'scale') {
      this.amapControls.removeChild(this.amapScaleControls)
    }
  }

  __handleRegionChange(map) {
    const onRegionChange = (detail) => {
      this.dispatchEvent(
        new CustomEvent('regionchange', {
          detail,
          bubbles: true,
          composed: true
        })
      )
    }
    map.on('dragstart', () => {
      const { lng, lat } = map.getCenter()
      onRegionChange({
        type: 'begin',
        scale: map.getZoom(),
        latitude: lat,
        longitude: lng,
        rotate: map.getRotation()
      })
    })
    map.on('dragend', () => {
      const { lng, lat } = map.getCenter()
      onRegionChange({
        type: 'end',
        scale: map.getZoom(),
        latitude: lat,
        longitude: lng,
        rotate: map.getRotation()
      })
    })
  }

  renderMap() {
    if (this[properties.ID]) {
      const noop = (e) => e
      window[`__AMAP_CONTENT_${this[properties.ID].toUpperCase()}`] = {
        calculateDistance: noop,
        changeMarkers: noop,
        clearRoute: noop,
        gestureEnable: noop,
        getCenterLocation: noop,
        getMapProperties: noop,
        getRegion: noop,
        moveToLocation: noop,
        showRoute: noop,
        showsCompass: noop,
        showsScale: noop,
        smoothMoveMarker: noop,
        smoothMovePolyline: noop,
        translateMarker: noop,
        updateComponents: noop
      }
    }

    mapReady(() => {
      requestAnimationFrame(() => {
        const map = new window.AMap.Map(this.mapTarget, {
          zoom: this[properties.SCALE],
          center: [this[properties.LONGITUDE], this[properties.LATITUDE]],
          rotation: this[properties.ROTATE]
        })
        if (!map) return
        this.map = map
        initMapApi(this, map)

        if (
          Array.isArray(this[properties.MARKERS]) &&
          this[properties.MARKERS].length
        ) {
          this.__handleFormatMarker(this[properties.MARKERS])
        }
        if (
          Array.isArray(this[properties.INCLUDE_POINTS]) &&
          this[properties.INCLUDE_POINTS].length
        ) {
          this.__drawIncludePoints(this[properties.INCLUDE_POINTS])
        }
        if (this[properties.CUSTOM_MAP_STYLE] === 'light') {
          map.setFeatures(['point', 'road'])
        }

        if (!window[`TRAFFICLAYER__${this[properties.ID].toUpperCase()}`]) {
          window[`TRAFFICLAYER__${this[properties.ID].toUpperCase()}`] =
            new window.AMap.TileLayer.Traffic({
              zIndex: 10
            })
          map.add(window[`TRAFFICLAYER__${this[properties.ID].toUpperCase()}`])
          window[`TRAFFICLAYER__${this[properties.ID].toUpperCase()}`].hide()
        }

        this.__handleRegionChange(map)

        if (
          Array.isArray(this[properties.POLYLINE]) &&
          this[properties.POLYLINE].length
        ) {
          this.__drawPolyline(this[properties.POLYLINE])
        }
      })
    })
  }

  static get styles() {
    return style
  }

  static get properties() {
    return {
      [properties.LONGITUDE]: { type: Number, attribute: attributes.LONGITUDE },
      [properties.LATITUDE]: { type: Number, attribute: attributes.LATITUDE },
      [properties.SCALE]: { type: Number, attribute: attributes.SCALE },
      [properties.SKEW]: { type: Number, attribute: attributes.SKEW },
      [properties.ROTATE]: { type: Number, attribute: attributes.ROTATE },
      [properties.MARKERS]: {
        converter: arrConverter,
        attribute: attributes.MARKERS
      },
      [properties.POLYLINE]: {
        converter: arrConverter,
        attribute: attributes.POLYLINE
      },
      [properties.CIRCLES]: {
        converter: arrConverter,
        attribute: attributes.CIRCLES
      },
      [properties.CONTROLS]: {
        converter: arrConverter,
        attribute: attributes.CONTROLS
      },
      [properties.POLYGON]: {
        converter: arrConverter,
        attribute: attributes.POLYGON
      },
      [properties.SHOW_LOCATION]: {
        converter: boolConverter,
        attribute: attributes.SHOW_LOCATION
      },
      [properties.INCLUDE_POINTS]: {
        converter: arrConverter,
        attribute: attributes.INCLUDE_POINTS
      },
      [properties.INCLUDE_PADDING]: {
        converter: objConverter,
        attribute: attributes.INCLUDE_PADDING
      },
      [properties.GROUND_OVERLAYS]: {
        converter: arrConverter,
        attribute: attributes.GROUND_OVERLAYS
      },
      [properties.TILE_OVERLAY]: {
        converter: objConverter,
        attribute: attributes.TILE_OVERLAY
      },
      [properties.CUSTOM_MAP_STYLE]: {
        converter: arrConverter,
        attribute: attributes.CUSTOM_MAP_STYLE
      },
      [properties.PANELS]: {
        converter: arrConverter,
        attribute: attributes.PANELS
      },
      [properties.SETTING]: {
        converter: objConverter,
        attribute: attributes.SETTING
      },
      [properties.ID]: { type: String, attribute: attributes.ID },
      [properties.AMAP_KEY]: { type: String, attribute: attributes.AMAP_KEY },
      [properties.AMAP_SDK]: { type: String, attribute: attributes.AMAP_SDK },
      [properties.AMAP_VERSION]: {
        type: String,
        attribute: attributes.AMAP_VERSION
      }
    }
  }

  @property()
  map

  @property()
  markers = []

  @property()
  polyline = []

  @property()
  includePoints = []

  @property({ type: Function })
  onTap

  @property({ type: Function })
  onPanelTap

  @query('#tiga-map-callout')
  callout: HTMLDivElement

  @query('.tiga-map-container')
  mapTarget: HTMLDivElement

  @query('.amap-controls')
  amapControls: HTMLDivElement

  @query('.amap-scalecontrol')
  amapScaleControls: HTMLDivElement

  render() {
    return html` <div class="tiga-map-container"></div> `
  }
}
