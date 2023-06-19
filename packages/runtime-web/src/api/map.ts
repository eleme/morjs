export default {
  createMapContext(id) {
    return window[`__AMAP_CONTENT_${id.toUpperCase()}`]
  },
  getMapInfo({ success }) {
    success &&
      success({
        is3d: false,
        isSupportAnim: false,
        sdkName: '',
        sdkVersion: '',
        isSupportOversea: false,
        needStyleV7: false
      })
  }
}
