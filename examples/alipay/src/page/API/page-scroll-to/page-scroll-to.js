Page({
  data: {
    scrollTop: 0
  },
  scrollTopChange(e) {
    this.setData({
      scrollTop: e.detail.value
    })
  },
  onPageScroll({ scrollTop }) {
    console.log('onPageScroll', scrollTop)
  },
  scrollTo() {
    my.pageScrollTo({
      scrollTop: parseInt(this.data.scrollTop)
    })
  }
})
