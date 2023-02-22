import transformLocation from './utils/location'

export default {
  getLocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (showPosition) => {
            const successRes = {
              latitude: showPosition.coords.latitude,
              longitude: showPosition.coords.longitude,
              accuracy: `${showPosition.coords.accuracy}`,
              horizontalAccuracy: `${showPosition.coords.altitudeAccuracy}`
            }

            resolve({ ...successRes, ...transformLocation(successRes) })
          },
          (e) => {
            let errorCode: IGetLocationFailErrorType = 11
            switch (e.code) {
              case e.PERMISSION_DENIED:
                errorCode = 11
                break
              case e.POSITION_UNAVAILABLE:
                errorCode = 13
                break
              case e.TIMEOUT:
                errorCode = 12
                break
            }
            const failRes: my.IGetLocationFailResult = {
              error: errorCode
              // errorMessage: '改浏览器不支持获取地理位置',
            }
            reject(failRes)
          },
          { enableHighAccuracy: true }
        )
      } else {
        const failRes: my.IGetLocationFailResult = {
          error: 11
          // errorMessage: '改浏览器不支持获取地理位置',
        }
        reject(failRes)
      }
    })
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  chooseLocation(): void {},

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  openLocation(): void {}
}
