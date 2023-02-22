Page({
  watchShake() {
    my.watchShake({
      success: function () {
        console.log('动起来了')
        my.alert({ title: '动起来了 o.o' })
      }
    })
  }
})
