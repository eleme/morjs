Page({
  onLoad() {},
  data: {},
  getAuthCode: () => {
    my.getAuthCode({
      scopes: 'auth_user',
      success: ({ authCode }) => {
        my.alert({
          content: authCode
        })
      }
    })
  }
})
