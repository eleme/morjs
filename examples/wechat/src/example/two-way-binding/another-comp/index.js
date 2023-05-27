// index/another_comp.js
Component({
  properties: {
    scrollTop: Number
  },
  data: {
    list: 10,
    innerScrollTop: 0
  },
  observers: {
    scrollTop: function (scrollTop) {
      // control the updating frequency
      if (this._scrollTopUpdateScheduled) {
        clearTimeout(this._scrollTopUpdateScheduled)
      }
      this._scrollTopUpdateScheduled = setTimeout(() => {
        this.setData({
          innerScrollTop: scrollTop
        })
      }, 250)
    }
  },
  methods: {
    onScroll: function (e) {
      this.setData({
        scrollTop: e.detail.scrollTop
      })
    }
  }
})
