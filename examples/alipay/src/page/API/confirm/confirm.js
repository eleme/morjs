Page({
  comfirm() {
    my.confirm({
      title: '温馨提示',
      content: '您是否想查询快递单号：\n1234567890',
      confirmButtonText: '马上查询',
      cancelButtonText: '暂不需要',
      success: (result) => {
        my.alert({
          title: `${result.confirm}`
        })
      }
    })
  }
})
