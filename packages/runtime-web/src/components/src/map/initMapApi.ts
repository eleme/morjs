import formatMapData from './formatMapData'

export default function (self, map) {
  const getCenterLocation = (options) => {
    const { lat, lng } = map.getCenter()
    const { success, complete } = options
    const loc = {
      longitude: lng,
      latitude: lat,
      scale: map.getZoom()
    }
    success && success(loc)
    complete && complete(loc)
  }

  const moveToLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { longitude = self.longitude, latitude = self.latitude } =
          position.coords || {}
        const pos = new window.AMap.LngLat(longitude, latitude)
        map.setCenter(pos)
        map.setZoom(self.scale)
      })
    }
  }

  const showsScale = (options) => {
    const { isShowsScale } = options
    // 同时引入工具条插件，比例尺插件和鹰眼插件
    window.AMap.plugin(['AMap.Scale'], () => {
      // 在图面添加比例尺控件，展示地图在当前层级和纬度下的比例尺
      if (isShowsScale) {
        map.addControl(new window.AMap.Scale())
      } else {
        self.__handleRemoveControl('scale')
      }
    })
  }

  const showsCompass = () => {
    console.warn('web不支持指南针')
  }

  const showRoute = (options) => {
    const {
      searchType = 'walk',
      startLat,
      startLng,
      endLat,
      endLng,
      success,
      routeColor = '#33B276',
      throughPoints,
      mode = 0,
      city,
      destinationCity
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

      if (Array.isArray(throughPoints) && throughPoints.length) {
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
        map,
        city,
        cityd: destinationCity,
        outlineColor: routeColor
      })

      plan.search(...params, (status, result) => {
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
            const marker = formatMapData.marker.bind(self)({
              width: 19,
              height: 31,
              latitude,
              longitude,
              iconPath
            })
            map.add(marker)
          })

          const { distance, time: duration } =
            (Array.isArray(routes) && routes[0]) || {}
          const ret = { distance, duration }
          success && success({ success: true, ...ret })
        }
      })
    })
  }

  const updateComponents = (options) => {
    const { latitude, longitude, scale, markers, polyline, setting } =
      options || {}

    if (latitude && longitude) {
      map.setCenter([longitude, latitude])
    }

    if (scale) {
      map.setZoom(scale)
    }

    if (Array.isArray(markers) && markers.length) {
      self.__handleFormatMarker(markers)
    }

    if (Array.isArray(polyline) && polyline.length) {
      self.__drawPolyline(polyline)
    }

    if (setting) {
      const { trafficEnabled, showScale, showMapText } = setting || {}
      if (Object.prototype.hasOwnProperty.call(setting, 'trafficEnabled')) {
        trafficEnabled
          ? window[`TRAFFICLAYER__${self.id.toUpperCase()}`].show()
          : window[`TRAFFICLAYER__${self.id.toUpperCase()}`].hide()
      }

      if (Object.prototype.hasOwnProperty.call(setting, 'showScale')) {
        showsScale({ isShowsScale: showScale })
      }

      if (Object.prototype.hasOwnProperty.call(setting, 'showMapText')) {
        const features = showMapText ? ['bg', 'point', 'road'] : ['bg', 'road']
        map.setFeatures(features)
      }
    }
  }

  if (self.id) {
    const noop = (e) => e
    Object.assign(window[`__AMAP_CONTENT_${self.id.toUpperCase()}`], {
      calculateDistance: noop,
      changeMarkers: noop,
      clearRoute: noop,
      gestureEnable: noop,
      getCenterLocation,
      getMapProperties: noop,
      getRegion: noop,
      moveToLocation,
      showRoute,
      showsCompass,
      showsScale,
      smoothMoveMarker: noop,
      smoothMovePolyline: noop,
      translateMarker: noop,
      updateComponents
    })
  }
}
