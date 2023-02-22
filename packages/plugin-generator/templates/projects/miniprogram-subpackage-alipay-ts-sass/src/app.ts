import { aApp } from '@morjs/core'

aApp({
  todos: [
    { text: 'Learning Javascript', completed: true },
    { text: 'Learning ES2016', completed: true },
    { text: 'Learning 支付宝小程序', completed: false }
  ],

  userInfo: null,

  getUserInfo() {
    return new Promise((resolve, reject) => {
      if (this.userInfo) resolve(this.userInfo)

      my.getAuthCode({
        scopes: ['auth_user'],
        success: (authcode) => {
          console.info(authcode)

          my.getAuthUserInfo({
            success: (res) => {
              this.userInfo = res
              resolve(this.userInfo)
            },
            fail: () => {
              reject({})
            }
          })
        },
        fail: () => {
          reject({})
        }
      })
    })
  }
})
