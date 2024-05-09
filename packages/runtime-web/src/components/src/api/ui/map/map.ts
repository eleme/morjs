import { html, property, query } from 'lit-element'
import get from 'lodash.get'
import { BaseElement } from '../../../baseElement'
import { requestAnimationFrame, uuid } from '../../../utils'
import addScript from '../../../utils/add-script'
import arrConverter from '../../../utils/array-converter'
import boolConverter from '../../../utils/bool-converter'
import EventBus from '../../../utils/event'
import objConverter from '../../../utils/object-converter'
import { sleep } from '../../../utils/sleep'
import { attributes, properties } from './property'
import style from './style'
import { arrow, invertedTriangle } from './svg-icon'

const AMAP_SDK = 'https://webapi.amap.com/maps'
const AMAP_VERSION = '2.0'
const LOAD_EVENT = 'LOAD'

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

// 高级定制能力，把box，image, text替换tiga标签
const transformTigaTag = (str) => {
  if (typeof str !== 'string') return

  return str
    .replace(
      /(<(\s+)?(box|text|image)[^>]+)\/>/g,
      ($1, $2, $3, $4) => `${$2}></tiga-map-${$4}>`
    )
    .replace(
      /<(\s+)?\/(\s+)?(box|text|image)(\s+)?>/g,
      ($1, $2, $3, $4) => `</tiga-map-${$4}>`
    )
    .replace(/<(\s+)?(box|text|image)/g, ($1, $2, $3) => `<tiga-map-${$3}`)
}
export default class Map extends BaseElement {
  mapId = 'map-' + uuid()
  // 对应高德地图中 setFitView 方法中的 avoid 参数
  fitViewAvoid = [60, 60, 60, 60]
  // 某些方法的执行依赖地图初始化完毕，在这里实例化一个事件对象，用于通知这些方法
  private drawEvent = new EventBus()

  constructor() {
    super()

    this.getDefaultProps()
  }

  getDefaultProps() {
    this[properties.LONGITUDE] = 121.380733
    this[properties.LATITUDE] = 31.233395
    this[properties.SCALE] = 16
    this[properties.ROTATE] = 0
    this[properties.SHOW_LOCATION] = false
  }

  connectedCallback() {
    super.connectedCallback()
    const mapConfig: any = this.getMapConfig()
    if (mapConfig.securityJsCode) {
      window._AMapSecurityConfig = {
        securityJsCode: mapConfig.securityJsCode
      }
    }

    this.loadAMapSdk(mapConfig, (res) => {
      if (res && res.error) return console.error(res.error)

      requestAnimationFrame(() => {
        this.drawMap(res)
        this.drawed = true
        this.drawEvent.emit(LOAD_EVENT)
      })
    })
  }

  createRenderRoot() {
    return this
  }

  disconnectedCallback() {
    super.disconnectedCallback()

    const controls = this[properties.CONTROLS]
    if (controls && controls.map) {
      controls.forEach((_, index) => {
        if (this[`controlListener${index}`]) {
          this.getEvent().removeListener(this[`controlListener${index}`])
        }
      })
    }
    if (this.map) {
      this.map = null
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)

    if (!this.drawed) return

    const AMap = window.AMap
    if (!AMap || !AMap.Map) {
      return
    }
    if (oldVal !== newVal) {
      if (name === 'longitude') {
        // change center
        this.map.setCenter([newVal, this[properties.LATITUDE]])
      }
      if (name === 'latitude') {
        // change center
        this.map.setCenter([this[properties.LONGITUDE], newVal])
      }
      if (name === 'scale') {
        // change scale
        this.map.setZoom(newVal)
      }
      if (name === 'markers') {
        // change markers
        this.__drawMarkers()
      }
      if (name === 'polyline') {
        // change polyline
        this.__drawPolyline()
      }
      if (name === 'polygon') {
        // change polygon
        this.__drawPolygon()
      }
      if (name === 'circles') {
        // change circles
        this.__drawCircles()
      }
      if (name === 'controls') {
        // change controls
        this.__drawControls()
      }
      if (name === 'includePoints') {
        this.__drawIncludePoints()
      }
      if (name === 'showLocation') {
        this.showLocation()
      }
    }
  }

  getMapConfig() {
    const defaultConfig = {
      version: AMAP_VERSION,
      sdk: AMAP_SDK
    }
    // 尝试从 window 中读取 map 配置，用户可在 mor.config 给 map 传递 信息
    const morConfig = get(window.$MOR_APP_CONFIG, 'components.map', {})
    const propertyConfig = {
      key: this[properties.AMAP_KEY],
      version: this[properties.AMAP_VERSION],
      sdk: this[properties.AMAP_SDK],
      mapStyle: this[properties.AMAP_STYLE],
      fitViewAvoid: this[properties.AMAP_FITVIEW_AVOID],
      securityJsCode: this[properties.AMAP_SECURITYCODE]
    }
    const config: Record<string, any> = {}
    // 优先级： 属性传入 > window 设置 > 默认配置
    Object.keys(propertyConfig).forEach((key) => {
      config[key] =
        propertyConfig[key] || morConfig[key] || defaultConfig[key] || ''
    })
    return config
  }

  loadAMapSdk({ key, version, sdk, mapStyle, fitViewAvoid }, callback) {
    if (typeof window.AMap === 'undefined') {
      addScript({
        src: `${sdk}?v=${version}&key=${key}`,
        success: () => {
          callback.call(this, { mapStyle, fitViewAvoid })
        },
        fail: (e) => {
          callback.call(this, {
            error: `load map sdk failed`
          })
        }
      })
    } else {
      callback.call(this)
    }
  }

  drawMap(res) {
    const mapParams: Record<string, any> = {
      zoom: this[properties.SCALE],
      zooms: [5, 18],
      center: [this[properties.LONGITUDE], this[properties.LATITUDE]],
      rotation: this[properties.ROTATE]
    }
    if (res && res.mapStyle) mapParams.mapStyle = res.mapStyle
    if (res && res.fitViewAvoid) this.fitViewAvoid = res.fitViewAvoid
    const map = new window.AMap.Map(this.mapId, mapParams)

    if (!map) return
    this.map = map

    // 监听onRegionChange事件
    this.__handleRegionChange()
    // show-location
    this.showLocation()
    // markers 标记点
    this.__drawMarkers()
    // polyline
    this.__drawPolyline()
    // polygon
    this.__drawPolygon()
    // circles
    this.__drawCircles()
    // controls
    this.__drawControls()
    // include-points 缩放视野以包含所有给定的坐标点 (wx 和 makers 分开的)
    this.__drawIncludePoints()

    // 绘制完成触发 init complete 事件（业务上可以通过此回调，获取 Map Context 实例，因为这个时机可以确保地图一定已经绘制）
    this.dispatchEvent(
      new CustomEvent('initcomplete', {
        detail: {
          id: this.id
        },
        bubbles: true,
        composed: true
      })
    )
  }

  getEvent() {
    // 低版本高德地图 key 为 event，2.0 版本为 Event
    return typeof window.AMap.Event !== 'undefined'
      ? window.AMap.Event
      : window.AMap.event
  }

  emitRegionChange(detail) {
    const { map } = this

    const { lng, lat } = map.getCenter()
    this.dispatchEvent(
      new CustomEvent('regionchange', {
        detail: {
          scale: map.getZoom(),
          latitude: lat,
          longitude: lng,
          rotate: map.getRotation(),
          ...detail
        },
        bubbles: true,
        composed: true
      })
    )
  }

  __handleRegionChange() {
    const { map } = this

    map.on('dragstart', (e) =>
      this.emitRegionChange({
        type: 'begin',
        causedBy: 'gesture'
      })
    )
    map.on('dragend', () =>
      this.emitRegionChange({
        type: 'end',
        causedBy: 'drag'
      })
    )
  }

  showLocation() {
    const { map } = this

    let geolocation
    if (this[properties.SHOW_LOCATION]) {
      window.AMap.plugin(['AMap.Geolocation'], () => {
        geolocation = new window.AMap.Geolocation({
          showButton: false
        })
        map.addControl(geolocation)
      })
    } else if (geolocation) {
      map.removeControl(geolocation)
    }
  }

  __drawPolyline(pl?) {
    this.clearPolyline()

    const polyline = pl || this[properties.POLYLINE]
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

  __drawPolygon() {
    this.clearPolygon()

    const polygon = this[properties.POLYGON]
    this.polygon = []
    if (polygon && polygon.map) {
      polygon.forEach((item) => {
        const lineArr = item.points.map((point) => [
          point.longitude,
          point.latitude
        ])
        const mapPolygon = new window.AMap.Polygon({
          path: lineArr, // 设置线覆盖物路径
          strokeColor: this.getHexAlpha(item.color).hex, // 线颜色
          strokeOpacity: this.getHexAlpha(item.color).alpha, // 线透明度
          strokeWeight: item.width || 5, // 线宽
          fillColor: this.getHexAlpha(item.fillColor).hex,
          fillOpacity: this.getHexAlpha(item.fillColor).alpha
        })
        mapPolygon.setMap(this.map)
        this.polygon.push(mapPolygon)
      })
    }
  }

  __drawCircles() {
    this.clearCircles()

    const circles = this[properties.CIRCLES]

    this.circles = []
    if (circles && circles.map) {
      circles.forEach((circle) => {
        // wx 不设置 color 或者 fillColor 那么就透明了
        const mapCircle = new window.AMap.Circle({
          center: [circle.longitude, circle.latitude], // 圆心位置
          radius: circle.radius, // 半径
          strokeColor: this.getHexAlpha(circle.color).hex, // 线颜色
          strokeOpacity: this.getHexAlpha(circle.color).alpha, // 线透明度
          strokeWeight: circle.strokeWidth || 5, // 线粗细度
          fillColor: this.getHexAlpha(circle.fillColor).hex, // 填充颜色
          fillOpacity: this.getHexAlpha(circle.fillColor).alpha // 填充透明度
        })
        mapCircle.setMap(this.map)
        this.circles.push(mapCircle)
      })
    }
  }

  __drawControls() {
    this.clearControls()

    const map = this.map
    const controls = this[properties.CONTROLS]
    this.controls = []
    if (controls && controls.map) {
      controls.forEach((control, index) => {
        const content: any = document.createElement('div')
        if (control.id) {
          content.id = control.id
        }
        content.innerHTML = `<img src="${control.iconPath}"
              style="width: 100%; height: 100%; vertical-align: middle" />`
        content.style.position = 'absolute'
        content.style.left = `${control.position.left}px`
        content.style.top = `${control.position.top}px`
        content.style.width = `${control.position.width}px`
        content.style.height = `${control.position.height}px`
        content.style.zIndex = 170
        if (control.clickable) {
          this[`controlListener${index}`] = this.getEvent().addDomListener(
            content,
            'click',
            () => {
              this.dispatchEvent(
                new CustomEvent('controltap', {
                  detail: control.id
                    ? {
                        controlId: control.id
                      }
                    : {},
                  bubbles: true,
                  composed: true
                })
              )
            }
          )
        }
        const customControl = {
          dom: content,
          addTo: () => {
            map.getContainer().appendChild(customControl.dom)
          },
          removeFrom: (map) => {
            map.getContainer().removeChild(customControl.dom)
          }
        }
        map && map.addControl(customControl)
        this.controls.push(customControl)
      })
    }
  }

  getMarkerOptions(item) {
    const {
      iconPath,
      width = 20,
      height = 34,
      alpha = 1,
      anchorX,
      anchorY,
      iconAppendStr,
      iconAppendStrColor,
      iconLayout
    } = item || {}

    const offset = anchorToOffset(anchorX, anchorY, width, height)

    if (iconLayout && iconLayout.data) {
      const { data } = iconLayout

      return {
        content: transformTigaTag(data),
        anchor: 'center',
        offset: new window.AMap.Pixel(anchorX || 0, anchorY || 0)
      }
    }

    let content = ''
    if (iconPath) {
      content += `<img src="${iconPath}" width="${width}" height="${height}" style="opacity:${alpha}" />`
    }

    if (iconAppendStr) {
      content += `<div class="icon-append-str" style="color: ${
        iconAppendStrColor || '#33b276'
      }">${iconAppendStr}</div>`
    }

    return {
      content,
      offset: new window.AMap.Pixel(offset.x, offset.y)
    }
  }

  getMarkerCallout(item) {
    const { customCallout, callout, longitude, latitude } = item || {}
    const isLayoutBubbleNone =
      customCallout &&
      customCallout.layoutBubble &&
      customCallout.layoutBubble.style === 'none'
    const renderTriangle = (type) => {
      if (isLayoutBubbleNone) return ''
      return invertedTriangle(
        '12px',
        '8px',
        type === 0 ? 'rgba(51, 51, 51, 0.9)' : '#fff'
      )
    }

    const calloutWrap = (slot, type = 2) => {
      return `<div id="tiga-map-callout" class="callout-wrap ${
        type === 0 ? 'callout-wrap-type-0' : ''
      }">
          ${slot}
          <div class="arrow" style="display: ${type === 2 ? 'none' : 'block'}">
            ${arrow('8px', '13.5px', type === 0 ? '#fff' : '#191919')}
          </div>
          <div class="inverted-triangle">
            ${renderTriangle(type)}
          </div>
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
          return `<div id="tiga-map-callout" class="callout-layout-wrap ${
            type === 0 ? 'callout-wrap-type-0' : ''
          } ${isLayoutBubbleNone ? 'callout-layout-wrap-no-style' : ''}">
              ${transformTigaTag(layout.data)}
              <div class="inverted-triangle">
              ${renderTriangle(type)}
            </div>
            </div>`
        }

        return calloutWrap(
          `<div class="callout">${customCalloutTime()}${customCalloutContent()}</div>`,
          type
        )
      }

      return {
        longitude,
        latitude,
        anchor: 'bottom-center',
        offset: new window.AMap.Pixel(0, -6),
        content: getContent()
      }
    }

    if (callout && callout.content) {
      return {
        longitude,
        latitude,
        anchor: 'bottom-center',
        offset: new window.AMap.Pixel(0, -6),
        content: calloutWrap(`<div class="callout">${callout.content}</div>`)
      }
    }
  }

  // 根据支付宝小程序callout优先级，找到优先级最高的callout
  findInfoWindowMarker(markers) {
    const isInRange = (maker) => {
      const { displayRanges = [] } = maker

      return (
        !displayRanges ||
        !displayRanges.length ||
        displayRanges.some((item) => {
          return (
            this[properties.SCALE] <= item.to &&
            this[properties.SCALE] >= item.from
          )
        })
      )
    }

    const customCalloutMarker = markers.find((item) => {
      const { customCallout } = item
      const inRange = isInRange(item)
      return inRange && customCallout && customCallout.isShow
    })

    const calloutMarker = markers.find((item) => {
      const { callout } = item
      const inRange = isInRange(item)
      return inRange && callout && callout.content
    })

    return customCalloutMarker || calloutMarker
  }

  __drawMarkers(mks?) {
    this.clearMarkers()

    const map = this.map
    const markers = mks || this[properties.MARKERS]

    this.markers = []
    this.infoWindow = null

    if (markers && markers.map) {
      markers.forEach((item) => {
        const marker = new window.AMap.Marker({
          position: [item.longitude, item.latitude],
          ...this.getMarkerOptions(item),
          title: item.title || '',
          angle: item.rotate || 0,
          extData: {
            id: item.id || ''
          },
          anchor: 'top-center'
        })

        map.add(marker)

        marker.on('click', () => {
          this.dispatchEvent(
            new CustomEvent('markertap', {
              detail: {},
              bubbles: true,
              composed: true
            })
          )
        })

        this.markers.push(marker)
      })

      const infoWind = this.findInfoWindowMarker(markers)

      if (infoWind) {
        const content = document.createElement('div')

        const markerCallout = this.getMarkerCallout(infoWind)
        content.innerHTML = markerCallout.content

        this.getEvent().addDomListener(content, 'click', () => {
          const { longitude, latitude, id } = infoWind
          this.dispatchEvent(
            new CustomEvent('callouttap', {
              detail: {
                markerId: id,
                longitude,
                latitude
              },
              bubbles: true,
              composed: true
            })
          )
        })
        const infoWindow = new window.AMap.InfoWindow({
          isCustom: true,
          ...markerCallout,
          content,
          autoMove: true
        })

        infoWindow.open(map, [markerCallout.longitude, markerCallout.latitude])
        this.infoWindow = infoWindow
      }
    }
  }

  __drawIncludePoints(ip?) {
    this.clearIncludePoints()

    const map = this.map
    this.includePoints = []
    const includePoints = ip || this[properties.INCLUDE_POINTS]
    if (includePoints && includePoints.map) {
      const includePointsArr = includePoints.map((point) => {
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
        map && map.setFitView(includePointsArr, true, this.fitViewAvoid)
      }
      this.includePoints = includePointsArr
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

  getCenterLocation(options) {
    const { success, complete, fail } = options
    const getCenterInfo = () => {
      const { lat, lng } = this.map.getCenter()
      const loc = {
        longitude: lng,
        latitude: lat,
        scale: this.map.getZoom()
      }

      return loc
    }

    if (this.map) {
      success && success(getCenterInfo())
      complete && complete()
    } else {
      const waitForLoad = new Promise((resolve) => {
        this.drawEvent.on(LOAD_EVENT, () => {
          resolve(LOAD_EVENT)
        })
      })
      // 如果 map 没有初始化完成，在这里监听地图完成事件
      // 最大等待时长 1s，超出则认为失败
      Promise.race([sleep(1000), waitForLoad]).then((value) => {
        if (value && value === LOAD_EVENT) success && success(getCenterInfo())
        else {
          fail && fail({ error: 'not init' })
        }
        complete && complete()
      })
    }
  }

  moveToLocation(options) {
    this.emitRegionChange({
      type: 'begin',
      causedBy: 'update'
    })

    const { longitude, latitude } = options || {}
    let location = null

    const move = (loc) => {
      const animationDuration = 300

      this.map.setCenter(loc, false, animationDuration)

      setTimeout(() => {
        this.emitRegionChange({
          type: 'end',
          causedBy: 'update'
        })
      }, animationDuration)
    }

    if (longitude && latitude) {
      location = [longitude, latitude]
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { longitude, latitude } = position.coords || {}
        location = new window.AMap.LngLat(longitude, latitude)
        move(location)
      })
      // 浏览器获取定位场景是异步的，所以走到这里之后直接返回，防止报错
      return
    } else {
      location = [this[properties.LONGITUDE], this[properties.LATITUDE]]
    }

    move(location)
  }

  getRotate(options) {
    const { success } = options
    const rotate = this.map.getRotation()

    success && success({ rotate })
  }

  getScale(options) {
    const { success } = options
    const scale = this.map.getZoom()

    success && success({ scale })
  }

  getSkew(options) {
    const { success } = options
    const skew = this.map.getPitch()

    success && success({ skew })
  }

  showsScale(options) {
    const map = this.map
    window.AMap.plugin(['AMap.Scale'], () => {
      if (!this.scale) {
        this.scale = new window.AMap.Scale({
          visible: !!options.isShowsScale
        })
        map.addControl(this.scale)
      }
      if (options.isShowsScale) {
        this.scale.show()
      } else {
        this.scale.hide()
      }
    })
  }

  showRoute(options) {
    const {
      searchType = 'walk',
      startLat,
      startLng,
      endLat,
      endLng,
      routeColor = '#33B276',
      throughPoints,
      mode = 0,
      city,
      destinationCity,
      success,
      fail,
      complete
    } = options
    let plugin = 'Walking'
    let policy
    let policyMod = 'LEAST_TIME'
    const throughPointsMarker = []

    const startLngLat = [startLng, startLat]
    const endLngLat = [endLng, endLat]

    const params: any[] = [startLngLat, endLngLat]

    if (searchType === 'bus') {
      plugin = 'Transfer'
      policy = 'TransferPolicy'
      policyMod =
        [
          'LEAST_TIME',
          'LEAST_FEE',
          'LEAST_TRANSFER',
          'LEAST_WALK',
          'MOST_COMFORT',
          'NO_SUBWAY'
        ][mode] || policyMod
    }

    if (searchType === 'drive') {
      plugin = 'Driving'
      policy = 'DrivingPolicy'
      policyMod =
        ['LEAST_TIME', 'LEAST_FEE', 'LEAST_DISTANCE', '', 'REAL_TRAFFIC'][
          mode
        ] || policyMod

      if (Array.isArray(throughPoints)) {
        const wayPoints = throughPoints.map(({ lng, lat }) => {
          throughPointsMarker.push({
            iconPath: 'https://webapi.amap.com/theme/v1.3/markers/b/mid.png',
            latitude: lat,
            longitude: lng
          })
          return new window.AMap.LngLat(lng, lat)
        })

        params.push({ wayPoints })
      }
    }

    if (searchType === 'ride') {
      plugin = 'Riding'
      policy = 0
    }

    window.AMap.plugin(`AMap.${plugin}`, () => {
      const plan = new window.AMap[plugin]({
        policy: policy && window.AMap[policy][policyMod],
        map: this.map,
        city,
        cityd: destinationCity,
        outlineColor: routeColor
      })

      plan.search(...params, (status, result) => {
        if (status === 'error') {
          fail && fail({ success: false, errorMsg: `规划路线失败：${result}` })
          complete && complete()
        }

        if (status === 'complete') {
          const { routes } = result

          // todo 公交路线图钉
          // if (searchType === 'bus' && Array.isArray(plans) && plans.length) {
          //   const { segments } = plans[0];
          // }

          throughPointsMarker.push({
            latitude: endLat,
            longitude: endLng,
            iconPath: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png'
          })

          throughPointsMarker.unshift({
            latitude: startLat,
            longitude: startLng,
            iconPath: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png'
          })

          throughPointsMarker.forEach((item) => {
            const { latitude, longitude, iconPath } = item

            this.__drawMarkers({
              width: 19,
              height: 31,
              latitude,
              longitude,
              iconPath
            })
          })

          const { distance, time: duration } =
            (Array.isArray(routes) && routes[0]) || {}
          const ret = { distance, duration }

          success && success({ success: true, ...ret })
          complete && complete()
        }
      })
    })
  }

  trafficEnabledShow() {
    if (!this.tileLayer) {
      this.tileLayer = new window.AMap.TileLayer.Traffic({
        zIndex: 10
      })
    }
    this.map.add(this.tileLayer)
  }

  trafficEnabledHide() {
    if (this.tileLayer) {
      this.tileLayer.hide()()
    }
  }

  clearRoute() {
    this.walking && this.walking.clear()
  }

  clearMarkers() {
    ;(this.markers || []).map((marker) => this.map.remove(marker))
    this.infoWindow && this.infoWindow.close()
  }

  clearPolyline() {
    ;(this.polyline || []).map((pl) => pl.setMap(null))
  }

  clearPolygon() {
    ;(this.polygon || []).map((pl) => pl.setMap(null))
  }

  clearCircles() {
    ;(this.circles || []).map((circle) => circle.setMap(null))
  }

  clearControls() {
    ;(this.controls || []).map((control) => this.map.removeControl(control))
  }

  clearIncludePoints() {
    ;(this.includePoints || []).map((marker) => marker.setMap(null))
  }

  updateComponent(options) {
    const {
      latitude,
      longitude,
      scale,
      markers,
      polyline,
      includePoints,
      setting
    } = options || {}

    if (latitude && longitude) {
      this.map.setCenter([longitude, latitude])
    }

    if (scale) {
      this.map.setZoom(scale)
    }

    if (Array.isArray(markers)) {
      this.__drawMarkers(markers)
    }

    if (Array.isArray(polyline)) {
      this.__drawPolyline(polyline)
    }

    if (Array.isArray(includePoints)) {
      this.__drawIncludePoints(includePoints)
    }

    if (setting) {
      const { trafficEnabled, showScale, showMapText } = setting || {}
      if (Object.prototype.hasOwnProperty.call(setting, 'trafficEnabled')) {
        trafficEnabled ? this.trafficEnabledShow() : this.trafficEnabledHide()
      }

      if (Object.prototype.hasOwnProperty.call(setting, 'showScale')) {
        this.showsScale({ isShowsScale: showScale })
      }

      if (Object.prototype.hasOwnProperty.call(setting, 'showMapText')) {
        const features = showMapText ? ['bg', 'point', 'road'] : ['bg', 'road']
        this.map.setFeatures(features)
      }
    }
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
      },
      [properties.AMAP_STYLE]: {
        type: String,
        attribute: attributes.AMAP_STYLE
      },
      [properties.AMAP_FITVIEW_AVOID]: {
        type: String,
        attribute: attributes.AMAP_FITVIEW_AVOID
      },
      [properties.AMAP_SECURITYCODE]: {
        type: String,
        attribute: attributes.AMAP_SECURITYCODE
      }
    }
  }

  @property()
  map

  @property()
  drawed = false

  @property()
  markers = []

  @property()
  infoWindow = null

  @property()
  polyline = []

  @property()
  polygon = []

  @property()
  circles = []

  @property()
  controls = []

  @property()
  includePoints = []

  @property()
  scale = null

  @property()
  walking = null

  @property()
  tileLayer

  @query('.tiga-map-container')
  rootMapElement: HTMLDivElement

  render() {
    return html`
      <style>
        ${style}
      </style>
      <div id="${this.mapId}" class="tiga-map-container"></div>
    `
  }
}
