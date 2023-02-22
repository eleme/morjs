import debounce from '/util/debounce'

const order = ['blue', 'red', 'green', 'yellow']

Page({
  data: {
    toView: 'red',
    scrollTop: 100
  },
  onLoad() {
    this.scroll = debounce(this.scroll.bind(this), 100)
  },
  upper(e) {
    console.log(e)
  },
  lower(e) {
    console.log(e)
  },
  scroll(e) {
    this.setData({
      scrollTop: e.detail.scrollTop
    })
  },
  scrollEnd() {},
  scrollToTop(e) {
    console.log(e)
    this.setData({
      scrollTop: 0
    })
  },
  tap(e) {
    for (let i = 0; i < order.length; ++i) {
      if (order[i] === this.data.toView) {
        const next = (i + 1) % order.length
        this.setData({
          toView: order[next],
          scrollTop: next * 200
        })
        break
      }
    }
  },
  tapMove() {
    this.setData({
      scrollTop: this.data.scrollTop + 10
    })
  }
})
