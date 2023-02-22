const markers = [
  {
    id: 0,
    latitude: 30.266786,
    longitude: 120.10675,
    width: 19,
    height: 31,
    iconPath:
      'https://gw.alicdn.com/imgextra/i1/O1CN01oZgfX01W3l98auyUV_!!6000000002733-2-tps-38-63.png',
    callout: {
      content: 'callout'
    }
  }
]

const animMarker = [
  {
    id: 1,
    latitude: 30.266786,
    longitude: 120.10675,
    width: 19,
    height: 31,

    iconPath:
      'https://gw.alicdn.com/imgextra/i1/O1CN01oZgfX01W3l98auyUV_!!6000000002733-2-tps-38-63.png',

    fixedPoint: {
      originX: 200,
      originY: 150
    },
    markerLevel: 2
  }
]

const labelMarker = [
  {
    id: 2,
    latitude: 30.266786,
    longitude: 120.10675,
    width: 19,
    height: 31,
    iconPath:
      'https://gw.alicdn.com/imgextra/i1/O1CN01oZgfX01W3l98auyUV_!!6000000002733-2-tps-38-63.png',
    label: {
      content: 'Hello Label',
      color: '#00FF00',
      fontSize: 14,
      borderRadius: 3,
      bgColor: '#ffffff',
      padding: 10
    },
    markerLevel: 2
  }
]
const customCalloutMarker = [
  {
    id: 3,
    latitude: 30.266786,
    longitude: 120.10675,
    width: 19,
    height: 31,
    iconPath:
      'https://gw.alicdn.com/imgextra/i1/O1CN01oZgfX01W3l98auyUV_!!6000000002733-2-tps-38-63.png',
    customCallout: {
      type: 2,
      descList: [
        {
          desc: '预计',
          descColor: '#333333'
        },
        {
          desc: '5分钟',
          descColor: '#108EE9'
        },
        {
          desc: '到达',
          descColor: '#333333'
        }
      ],
      isShow: 1
    },
    markerLevel: 2
  }
]

const iconAppendStrMarker = [
  {
    id: 34,
    latitude: 30.266786,
    longitude: 120.10675,
    width: 19,
    height: 31,
    iconAppendStr: 'iconAppendStr',
    markerLevel: 2
  }
]

var myTrafficEnabled = 0
var myCompassEnabled = 0
var myScaleEnabled = 0
var myGestureEnabled = 0

const longitude = 120.10675
const latitude = 30.266786
const includePoints = [
  {
    latitude: 30.266786,
    longitude: 120.10675
  }
]

Page({
  data: {
    scale: 14,
    longitude,
    latitude,
    includePoints
  },
  onReady() {
    // 使用 my.createMapContext 获取 map 上下文
    this.mapCtx = my.createMapContext('map')
  },
  demoResetMap() {
    this.setData({
      scale: 14,
      longitude,
      latitude,
      includePoints,
      'ground-overlays': [],
      circles: [],
      polygon: [],
      polyline: []
    })
    this.mapCtx.clearRoute()
  },
  demoGetCenterLocation() {
    this.mapCtx.getCenterLocation({
      success: (res) => {
        my.alert({
          content:
            'longitude:' +
            res.longitude +
            '\nlatitude:' +
            res.latitude +
            '\nscale:' +
            res.scale
        })
        console.log(res.longitude)
        console.log(res.latitude)
        console.log(res.scale)
      }
    })
  },
  demoMoveToLocation() {
    this.mapCtx.moveToLocation()
  },
  demoMarkerAnimation() {
    if (!my.canIUse('createMapContext.return.updateComponents')) {
      my.alert({
        title: '客户端版本过低',
        content: 'this.mapCtx.updateComponents 需要 10.1.35 及以上版本'
      })
      return
    }
    this.mapCtx.updateComponents({
      markers: animMarker
    })
    this.mapCtx.updateComponents({
      command: {
        markerAnim: [{ markerId: 1, type: 0 }]
      }
    })
  },
  demoMarkerLabel() {
    if (!my.canIUse('createMapContext.return.updateComponents')) {
      my.alert({
        title: '客户端版本过低',
        content: 'this.mapCtx.updateComponents 需要 10.1.35 及以上版本'
      })
      return
    }
    this.mapCtx.updateComponents({
      scale: 14,
      longitude,
      latitude,
      includePoints,
      markers: labelMarker
    })
  },
  demoMarkerCustomCallout() {
    this.mapCtx.updateComponents({
      scale: 14,
      longitude,
      latitude,
      includePoints,
      markers: customCalloutMarker
    })
  },
  demoMarkerAppendStr() {
    this.mapCtx.updateComponents({
      scale: 14,
      longitude,
      latitude,
      includePoints,
      markers: iconAppendStrMarker
    })
  },
  demoTrafficOverlay() {
    if (!my.canIUse('createMapContext.return.updateComponents')) {
      my.alert({
        title: '客户端版本过低',
        content: 'this.mapCtx.updateComponents 需要 10.1.35 及以上版本'
      })
      return
    }
    myTrafficEnabled = (myTrafficEnabled + 1) % 2
    this.mapCtx.updateComponents({
      setting: { trafficEnabled: myTrafficEnabled }
    })
  },
  demoShowRoute() {
    this.mapCtx.showRoute({
      startLat: 30.257839,
      startLng: 120.062726,
      endLat: 30.256718,
      endLng: 120.059985,
      zIndex: 4,
      routeColor: '#FFB90F',
      iconPath:
        'https://gw.alicdn.com/imgextra/i1/O1CN01vmyY3v1udzFfdXfn9_!!6000000006061-2-tps-64-64.png',
      iconWidth: 10,
      routeWidth: 10
    })
  },
  demoCompass() {
    myCompassEnabled = (myCompassEnabled + 1) % 2
    this.mapCtx.showsCompass({ isShowsCompass: myCompassEnabled })
  },
  demoScale() {
    myScaleEnabled = (myScaleEnabled + 1) % 2
    this.mapCtx.showsScale({ isShowsScale: myScaleEnabled })
  },
  demoGesture() {
    myGestureEnabled = (myGestureEnabled + 1) % 2
    this.mapCtx.gestureEnable({ isGestureEnable: myGestureEnabled })
  },
  demoPolyline() {
    this.setData({
      scale: 16,
      longitude,
      latitude,
      polyline: [
        {
          points: [
            {
              // 右上
              latitude: 30.264786,
              longitude: 120.10775
            },
            {
              // 左下
              latitude: 30.268786,
              longitude: 120.10575
            }
          ],
          color: '#FF0000DD',
          width: 10,
          dottedLine: false,
          iconPath:
            'https://gw.alicdn.com/imgextra/i1/O1CN01vmyY3v1udzFfdXfn9_!!6000000006061-2-tps-64-64.png',
          iconWidth: 10
        }
      ]
    })
  },
  demoPolygon() {
    this.setData({
      scale: 16,
      longitude,
      latitude,
      polygon: [
        {
          points: [
            {
              // 右上
              latitude: 30.264786,
              longitude: 120.10775
            },
            {
              // 右下
              latitude: 30.268786,
              longitude: 120.10775
            },
            {
              // 左下
              latitude: 30.268786,
              longitude: 120.10575
            },
            {
              // 左上
              latitude: 30.264786,
              longitude: 120.10575
            }
          ],
          fillColor: '#BB0000DD',
          width: 5
        }
      ]
    })
  },
  demoCircle() {
    this.setData({
      scale: 16,
      longitude,
      latitude,
      circles: [
        {
          longitude,
          latitude,
          color: '#BB76FF88',
          fillColor: '#BB76FF33',
          radius: 100,
          strokeWidth: 3
        }
      ]
    })
  },
  regionchange(e) {
    console.log('regionchange', e)
  },
  markertap(e) {
    console.log('marker tap', e)
  },
  controltap(e) {
    console.log('control tap', e)
  },
  tap() {
    console.log('tap')
  },
  callouttap(e) {
    console.log('callout tap', e)
  }
})
