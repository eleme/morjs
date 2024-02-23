import { my } from '../../../../../api/my'

const MAP_INFO = {
  is3d: false,
  isSupportAnim: false,
  sdkName: '',
  sdkVersion: '',
  isSupportOversea: false,
  needStyleV7: false
}

const MAP_CONTAINER_SELECTOR = '.tiga-map-container' // 需要和 ./map.ts 中地图的外层组件 class 保持一致

export default {
  createMapContext(id) {
    const context = new CreateMapContext(id)
    const { map } = context

    if (!map) return null
    return context
  },
  getMapInfo() {
    return Promise.resolve(MAP_INFO)
  }
}

class CreateMapContext {
  map: any

  constructor(mapId) {
    if (
      typeof my === 'object' &&
      typeof my.createSelectorQuery === 'function'
    ) {
      this.map = (my.createSelectorQuery().select(`#${mapId}`) as any).target
    } else {
      this.map = document.getElementById(mapId)
    }
  }

  calculateDistance() {
    console.warn('暂不支持')
  }

  changeMarkers() {
    console.warn('暂不支持')
  }

  clearRoute() {
    return this.map.clearRoute()
  }

  gestureEnable() {
    console.warn('web不支持手势')
  }

  getCenterLocation(options) {
    return this.map.getCenterLocation(options)
  }

  getMapProperties(options) {
    const { success } = options
    success && success(MAP_INFO)
  }

  getRegion() {
    console.warn('暂不支持')
  }

  moveToLocation(options) {
    return this.map.moveToLocation(options)
  }

  showRoute(options) {
    return this.map.showRoute(options)
  }

  showsCompass() {
    console.warn('web不支持指南针')
  }

  showsScale(options) {
    return this.map.showsScale(options)
  }

  smoothMoveMarker() {
    console.warn('暂不支持')
  }

  smoothMovePolyline() {
    console.warn('暂不支持')
  }

  translateMarker() {
    console.warn('暂不支持')
  }

  updateComponents(options) {
    return this.map.updateComponent(options)
  }

  getRotate(options) {
    return this.map.getRotate(options)
  }

  getScale(options) {
    return this.map.getScale(options)
  }

  getSkew(options) {
    return this.map.getSkew(options)
  }

  includePoints(options) {
    const { points } = options

    return this.map.__drawIncludePoints(points)
  }

  mapToScreen() {
    console.warn('暂不支持')
  }

  screenToMap() {
    console.warn('暂不支持')
  }

  polygonContainsPoint() {
    console.warn('暂不支持')
  }

  setCenterOffset() {
    console.warn('暂不支持')
  }

  setMapType() {
    console.warn('暂不支持')
  }

  smoothMoveMarke() {
    console.warn('暂不支持')
  }
}
