import { aApp } from '@morjs/core'
aApp({
  onShow() {
    setTimeout(() => {
      console.log('++onAppShow')
    }, 200)
  }
})
