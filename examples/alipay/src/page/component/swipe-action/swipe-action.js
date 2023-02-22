Page({
  data: {
    swipeIndex: null,
    list: [
      {
        right: [{ type: 'delete', text: '删除', fColor: 'black' }],
        content: '更换文字颜色'
      },
      {
        right: [
          { type: 'edit', text: '取消收藏', fColor: 'rgba(0,0,0,.5)' },
          { type: 'delete', text: '删除', fColor: 'yellow' },
          { type: 'other', text: '新增一个' }
        ],
        content: '改变文字颜色'
      },
      {
        right: [
          { type: 'edit', text: '取消收藏', bgColor: '#333' },
          { type: 'delete', text: '删除' }
        ],
        content: '其中一个背景色变化'
      },
      {
        right: [
          { type: 'edit', text: '取消收藏', bgColor: '#ccc', fColor: '#f00' },
          { type: 'delete', text: '删除', bgColor: '#0ff', fColor: '#333' }
        ],
        content: '文字和背景色同时改变'
      },
      {
        right: [
          { type: 'edit', text: '取消收藏取消收藏取消' },
          { type: 'delete', text: '删除删除删除删除' }
        ],
        content: '默认颜色样式'
      },
      {
        right: [
          { type: 'edit', text: '取消关注' },
          { type: 'other', text: '免打扰' },
          { type: 'delete', text: '删除' }
        ],
        content: '三个选项的卡片'
      },
      {
        right: [
          { type: 'edit', text: '取消关注' },
          { type: 'other', text: '免打扰' },
          { type: 'delete', text: '删除' }
        ],
        content:
          '三个选项的卡片三个选项的卡片三个选项的卡片三个选项的卡片三个选项的卡片三个选项的卡片三个选项的卡片三个选项的卡片三个选项的卡片三个选项的卡片三个选项的卡片三个选项的卡片三个选项的卡片三个选项的卡片三个选项的卡片三个选项的卡片三个选项的卡片'
      }
    ]
  },
  onRightItemClick(e) {
    const { type } = e.detail
    my.confirm({
      title: '温馨提示',
      content: `${e.index}-${e.extra}-${JSON.stringify(e.detail)}`,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: (result) => {
        // const { list } = this.data;
        if (result.confirm) {
          if (type === 'delete') {
            // list.splice(this.data.swipeIndex, 1);
            my.showToast({
              content: '确认 => 可进行删除数据操作'
            })
          }
          e.done()
        } else {
          my.showToast({
            content: '取消 => 滑动删除状态保持不变'
          })
        }
      }
    })
  },
  onItemClick(e) {
    my.alert({
      content: `dada${e.index}`
    })
  },
  onSwipeStart(e) {
    this.setData({
      swipeIndex: e.index
    })
  }
})
