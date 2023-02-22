Page({
  data: {
    nodes: [
      {
        name: 'div',
        attrs: {
          class: 'wrapper',
          style: 'color: orange;'
        },
        children: [
          {
            type: 'text',
            text: 'Hello&nbsp;World!'
          }
        ]
      }
    ]
  },
  tap() {
    console.log('tap')
  }
})
