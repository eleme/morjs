Page({
  data: {
    text: '3.1415926',
    copy: ''
  },

  handleInput(e) {
    this.setData({
      text: e.detail.value
    })
  },

  handleCopy() {
    my.setClipboard({
      text: this.data.text
    })
  },

  handlePaste() {
    my.getClipboard({
      success: ({ text }) => {
        this.setData({ copy: text })
      }
    })
  }
})
