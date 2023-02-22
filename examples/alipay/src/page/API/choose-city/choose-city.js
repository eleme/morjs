Page({
  chooseCity() {
    my.chooseCity({
      showLocatedCity: true,
      showHotCities: true,
      success: (res) => {
        my.alert({
          title: 'chooseCity response: ' + JSON.stringify(res)
        })
      }
    })
  },
  setLocatedCity() {
    my.onLocatedComplete({
      success: (res) => {
        my.setLocatedCity({
          locatedCityId: res.locatedCityId, //res.locatedCityId
          locatedCityName: '修改后的城市名',
          success: (res) => {
            my.alert({ content: '修改当前定位城市成功' + JSON.stringify(res) })
          },
          fail: (error) => {
            my.alert({
              content: '修改当前定位城市失败' + JSON.stringify(error)
            })
          }
        })
      },
      fail: (error) => {
        my.alert({ content: 'onLocatedComplete失败' + JSON.stringify(error) })
      }
    })
    my.chooseCity({
      showLocatedCity: true,
      showHotCities: true,
      setLocatedCity: true,
      success: (res) => {
        my.alert({
          title: 'chooseCity response: ' + JSON.stringify(res)
        })
      }
    })
  }
})
