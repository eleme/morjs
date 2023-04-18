import { wApp } from '@morjs/core'
wApp({
  onShow() {
    setTimeout(() => {
      console.log('++onAppShow')
    }, 200)
  }
})
