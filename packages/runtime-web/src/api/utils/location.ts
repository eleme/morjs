/*
 * WGS-84：是国际标准，GPS坐标（Google Earth使用、或者GPS模块、天地图）
 * GCJ-02：中国坐标偏移标准，Google Map、高德、腾讯使用
 * BD-09：百度坐标偏移标准，Baidu Map使用
 */

// eslint-disable-next-line @typescript-eslint/no-loss-of-precision
const PI = 3.14159265358979324
// eslint-disable-next-line @typescript-eslint/no-loss-of-precision
const EE = 0.00669342162296594323
const A = 6378245.0

function transformLat(latitude, longitude) {
  let result =
    -100.0 +
    2.0 * latitude +
    3.0 * longitude +
    0.2 * longitude * longitude +
    0.1 * latitude * longitude +
    0.2 * Math.sqrt(Math.abs(latitude))
  result +=
    ((20.0 * Math.sin(6.0 * latitude * PI) +
      20.0 * Math.sin(2.0 * latitude * PI)) *
      2.0) /
    3.0
  result +=
    ((20.0 * Math.sin(longitude * PI) +
      40.0 * Math.sin((longitude / 3.0) * PI)) *
      2.0) /
    3.0
  result +=
    ((160.0 * Math.sin((longitude / 12.0) * PI) +
      320 * Math.sin((longitude * PI) / 30.0)) *
      2.0) /
    3.0
  return result
}

function transformLon(latitude, longitude) {
  let result =
    300.0 +
    latitude +
    2.0 * longitude +
    0.1 * latitude * latitude +
    0.1 * latitude * longitude +
    0.1 * Math.sqrt(Math.abs(latitude))
  result +=
    ((20.0 * Math.sin(6.0 * latitude * PI) +
      20.0 * Math.sin(2.0 * latitude * PI)) *
      2.0) /
    3.0
  result +=
    ((20.0 * Math.sin(latitude * PI) + 40.0 * Math.sin((latitude / 3.0) * PI)) *
      2.0) /
    3.0
  result +=
    ((150.0 * Math.sin((latitude / 12.0) * PI) +
      300.0 * Math.sin((latitude / 30.0) * PI)) *
      2.0) /
    3.0
  return result
}

export default ({ latitude, longitude }) => {
  try {
    // 转换类型，避免因业务获取到 string 类型的经纬度导致计算错误
    latitude = Number(latitude)
    longitude = Number(longitude)
  } catch (e) {
    return { latitude, longitude }
  }

  let dLat = transformLat(longitude - 105.0, latitude - 35.0)
  let dLon = transformLon(longitude - 105.0, latitude - 35.0)
  const radLat = (latitude / 180.0) * PI
  let magic = Math.sin(radLat)
  magic = 1 - EE * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  dLat = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI)
  dLon = (dLon * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * PI)

  return {
    longitude: +(longitude + dLon).toFixed(6) + '',
    latitude: +(latitude + dLat).toFixed(6) + ''
  }
}
