import { aPage } from '@morjs/core'

const app = getApp()

aPage({
  data: {
    inputValue: ''
  },

  onBlur(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  add() {
    app.todos = app.todos.concat([
      {
        text: this.data.inputValue,
        compeleted: false
      }
    ])

    my.navigateBack()
  }
})
