Page({
  data: {
    src: 'http://flv.bn.netease.com/tvmrepo/2012/7/C/7/E868IGRC7-mobile.mp4',
    //src:"https://youtu.be/J_WcqN1Hipg",
    title: 'initial',
    autoplay: 'false',
    objectFit: 'contain',
    showFullscreenBtn: 'false',
    showCenterPlayBtn: 'false',
    muted: 'false',
    loop: 'false'
  },

  onShow() {
    this.videoContext = my.createVideoContext('video')
    this.muted = this.data.muted === 'true'
  },
  onPlay() {
    console.log('onPlay')
    this.setData({ title: 'onPlay' })
  },
  onPause() {
    console.log('onPause')
    this.setData({ title: 'onPause' })
  },
  onEnded() {
    console.log('onEnded')
    this.setData({ title: 'onEnded' })
  },
  onTimeUpdate() {
    console.log('onTimeUpdate')
    this.setData({ title: 'onTimeUpdate' })
  },
  onLoading(res) {
    my.alert({ content: '加载中！' + JSON.stringify(res) })
    console.log('onLoading')
    this.setData({ title: 'onLoading' })
  },
  onStop() {
    console.log('onStop')
    this.setData({ title: 'onStop' })
  },
  play() {
    this.videoContext.play()
    this.videoContext.mute(this.muted)
  },
  pause() {
    this.videoContext.pause()
  },
  seek() {
    this.videoContext.seek(15)
  },
  mute() {
    this.videoContext.mute(!this.muted)
    this.muted = !this.muted
  },
  stop() {
    this.videoContext.stop()
    this.setData({ muted: this.muted.toString() })
  },
  playbackRate(res) {
    this.videoContext.playbackRate(1.5),
      my.alert({ content: '倍速播放中！' + JSON.stringify(res) })
  },
  requestFullScreen() {
    this.videoContext.requestFullScreen({ direction: 90 })
    // setTimeout(() => { this.videoContext.exitFullScreen()},2000)
  },
  exitFullScreen() {
    this.videoContext.requestFullScreen()
    setTimeout(() => {
      this.videoContext.exitFullScreen()
    }, 2000)
  },
  showStatusBar() {
    this.videoContext.requestFullScreen()
    setTimeout(() => {
      this.videoContext.showStatusBar()
    }, 2000)
  },
  hideStatusBar() {
    this.videoContext.requestFullScreen()
    setTimeout(() => {
      this.videoContext.hideStatusBar()
    }, 2000)
  }
})
