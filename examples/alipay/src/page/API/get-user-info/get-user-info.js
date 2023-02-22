var app = getApp()
Page({
  data: {
    hasUserInfo: false
  },
  getUserInfo() {
    my.getAuthCode({
      scopes: 'auth_user',
      fail: (error) => {
        console.error('getAuthCode', error)
      },
      success: () => {
        // do login...
        // then
        my.getAuthUserInfo({
          fail: (error) => {
            console.error('getAuthUserInfo', error)
          },
          success: (userInfo) => {
            console.log(`userInfo:`, userInfo)
            this.setData({
              userInfo,
              hasUserInfo: true
            })
            abridge.alert({
              title: JSON.stringify(userInfo) // alert 框的标题
            })
          }
        })
      }
    })
  },
  clear() {
    this.setData({
      hasUserInfo: false,
      userInfo: {}
    })
  }
})
