Page({
  openMultiLevelSelect() {
    my.multiLevelSelect({
      title: '多级联选择器', //级联选择标题
      list: [
        {
          name: '杭州市', //条目名称
          subList: [
            {
              name: '西湖区',
              subList: [
                {
                  name: '古翠街道'
                },
                {
                  name: '文新街道'
                }
              ]
            },
            {
              name: '上城区',
              subList: [
                {
                  name: '延安街道'
                },
                {
                  name: '龙翔桥街道'
                }
              ]
            }
          ] //级联子数据列表
        }
      ], //级联数据列表
      success: (res) => {
        my.alert({ title: JSON.stringify(res) })
      }
    })
  }
})
