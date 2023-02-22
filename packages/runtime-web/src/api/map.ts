export default {
  createMapContext(id) {
    // {
    //   clearRoute: '',
    //   getCenterLocation: 'getCenterLocation',
    //   moveToLocation: 'moveToLocation',
    //   updateComponents: '',
    //   showRoute: 'showRoute',
    //   showsCompass: 'showsCompass',
    //   showsScale: 'showsScale',
    //   gestureEnable: '',
    // };
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
