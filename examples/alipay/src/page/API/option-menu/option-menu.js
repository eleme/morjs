Page({
  onOptionMenuClick(e) {
    my.alert({
      content: `click option menu with index: ${JSON.stringify(e.data.index)}`
    })
  }
})
