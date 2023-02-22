const thumb =
  'https://gw.alipayobjects.com/mdn/rms_ce4c6f/afts/img/A*XMCgSYx3f50AAAAAAAAAAABkARQnAQ'
Page({
  data: {
    title: '单行列表1',
    extra: '详细信息',
    arrow: true,
    upperSubtitle: '上副标题',
    lowerSubtitle: '',
    thumb,
    borderRadius: false,
    useThumb: true,
    thumbSize: 40,
    primarySlotTypes: ['无内容', '标签', '问号图标'],
    supSlotTypes: ['无内容', '标签', '问号图标', '勾图标', '文字内容'],
    secSlotTypes: [
      '无内容',
      '文字内容',
      '标签',
      '问号图标',
      '勾图标',
      '开关',
      '胶囊按钮',
      'list-secondary'
    ],
    supSlotIndex: 0,
    secSlotIndex: 0,
    titleSlotIndex: 0,
    upperSlotIndex: 0,
    lowerSlotIndex: 0,
    titleTagText: '标签',
    upperTagText: '标签',
    lowerTagText: '标签',
    supTagText: '标签',
    supText: '文字内容',
    secTagText: '标签',
    secText: '详细信息',
    titleIconSize: 17,
    upperIconSize: 17,
    lowerIconSize: 17,
    supIconSize: 17,
    secIconSize: 17,
    titlePositions: ['top', 'middle', 'bottom'],
    titlePosIndex: 0,
    secondary: {
      title: '次要信息',
      subtitle: '次要辅助信息',
      thumb,
      useThumb: false,
      thumbSize: undefined
    }
  },
  setInfo(e) {
    const { dataset } = e.target
    const { name } = dataset
    if (name) {
      this.setData({
        [name]: e.detail.value
      })
    }
  },
  setSecInfo(e) {
    const { dataset } = e.target
    const { name } = dataset
    if (name) {
      this.setData({
        secondary: {
          ...this.data.secondary,
          [name]: e.detail.value
        }
      })
    }
  }
})
