Page({
  onReady(e) {
    this.backgroundAudioManager = my.getBackgroundAudioManager()
    //this.backgroundAudioManager.src = '';
    //this.backgroundAudioManager.startTime = 10000;
    this.backgroundAudioManager.src =
      'http://ws.stream.qqmusic.qq.com/M500001VfvsJ21xFqb.mp3?guid=ffffffff82def4af4b12b3cd9337d5e7&uin=346897220&vkey=6292F51E1E384E061FF02C31F716658E5C81F5594D561F2E88B854E81CAAB7806D5E4F103E55D33C16F3FAC506D1AB172DE8600B37E43FAD&fromtag=46'

    this.backgroundAudioManager.onPlay(() => {
      console.log('back onPlay')
      my.alert({
        content: '开始播放'
      })
    })
    this.backgroundAudioManager.onPause(() => {
      console.log('back onPause')
      my.alert({
        content: '暂停播放'
      })
    })
    this.backgroundAudioManager.onCanplay(() => {
      console.log('back onCanplay')
      my.alert({
        content: '音频进入可以播放状态'
      })
    })
    this.backgroundAudioManager.onStop(() => {
      console.log('back onStop')
      my.alert({
        content: '背景音频停止事件'
      })
    })
    this.backgroundAudioManager.onEnded(() => {
      console.log('back onEnded')
      my.alert({
        content: '背景音频自然播放结束事件'
      })
    })
    this.backgroundAudioManager.onTimeUpdate(() => {
      console.log('onTimeUpdate')
      /*my.alert({
        content:'背景音频播放进度更新事件'
      });*/
    })
    this.backgroundAudioManager.onPrev(() => {
      console.log('back onPrev')
      my.alert({
        content: '点击上一曲事件'
      })
    })
    this.backgroundAudioManager.onNext(() => {
      console.log('back onNext')
      my.alert({
        content: '点击下一曲事件'
      })
    })
    this.backgroundAudioManager.onError(() => {
      console.log('back onError')
      my.alert({
        content: '背景音频播放错误事件'
      })
    })
    this.backgroundAudioManager.onWaiting(() => {
      console.log('back onWaiting')
    })
  },

  audioPlay: function () {
    console.log('call play')
    this.backgroundAudioManager.play()
    console.log('call play end')
  },
  audioPause: function () {
    console.log('call pause')
    this.backgroundAudioManager.pause()
  },
  audioStop: function () {
    console.log('call stop')
    this.backgroundAudioManager.stop()
  },
  audio14: function () {
    console.log('call seek 14')
    this.backgroundAudioManager.seek(14)
  },
  audioStart: function () {
    console.log('call seek 0')
    this.backgroundAudioManager.seek(0)
  },

  getAllProps() {
    let result = {
      duration: this.backgroundAudioManager.duration,
      currentTime: this.backgroundAudioManager.currentTime,
      paused: this.backgroundAudioManager.paused,
      startTime: this.backgroundAudioManager.startTime,
      buffered: this.backgroundAudioManager.buffered,
      src: this.backgroundAudioManager.src
    }
    my.alert({ content: JSON.stringify(result) })
  }
})
