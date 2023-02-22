// const imgUrl = '';
const newitems = [
  {
    thumb:
      'https://gw.alipayobjects.com/zos/rmsportal/KXDIRejMrRdKlSEcLseB.png',
    title: '固定到头部',
    arrow: true,
    sticky: true
  },
  {
    title: '标题文字不换行很长很长很长很长很长很长很长很长很长很长',
    arrow: true
  },
  {
    title: '标题文字换行很长很长很长很长很长很长很长很长很长很长',
    arrow: true,
    textMode: 'wrap'
  },
  {
    title: '标题文字很长很长很长很长很长很长很长很长很长很长很长很长很长很长',
    extra: '没有箭头',
    textMode: 'wrap'
  },
  {
    title: '标题文字很长很长很长很长很长很长很长很长很长很长很长很长很长很长',
    extra: '子元素垂直对齐',
    textMode: 'wrap',
    align: 'top'
  },
  {
    title: '标题文字换行很长很长很长很长很长很长很长很长很长很长',
    arrow: true,
    textMode: 'wrap'
  },
  {
    title: '标题文字很长很长很长很长很长很长很长很长很长很长很长很长很长很长',
    extra: '没有箭头',
    textMode: 'wrap'
  },
  {
    title: '标题文字很长很长很长很长很长很长很长很长很长很长很长很长很长很长',
    extra: '子元素垂直对齐',
    textMode: 'wrap',
    align: 'top'
  },
  {
    title: '标题文字换行很长很长很长很长很长很长很长很长很长很长',
    arrow: true,
    textMode: 'wrap'
  },
  {
    title: '标题文字很长很长很长很长很长很长很长很长很长很长很长很长很长很长',
    extra: '没有箭头',
    textMode: 'wrap'
  },
  {
    title: '标题文字很长很长很长很长很长很长很长很长很长很长很长很长很长很长',
    extra: '子元素垂直对齐',
    textMode: 'wrap',
    align: 'top'
  },
  {
    title: '标题文字换行很长很长很长很长很长很长很长很长很长很长',
    arrow: true,
    textMode: 'wrap'
  },
  {
    title: '标题文字很长很长很长很长很长很长很长很长很长很长很长很长很长很长',
    extra: '没有箭头',
    textMode: 'wrap'
  },
  {
    title: '标题文字很长很长很长很长很长很长很长很长很长很长很长很长很长很长',
    extra: '子元素垂直对齐',
    textMode: 'wrap',
    align: 'top'
  }
]
Page({
  data: {
    items: [
      {
        title: '单行列表1',
        extra: '详细信息',
        arrow: true
      },
      {
        title: '单行列表2',
        extra: '+20.08',
        arrow: true,
        enforceExtra: true
      },
      {
        title: '单行开关3',
        actionType: 'switch',
        index: 'switch',
        lineTouchable: false
      },
      {
        title: '单行选项4',
        actionType: 'check',
        // actionValue: false,
        index: 'check'
      },
      {
        title: '单行列表5',
        actionType: 'capsule',
        capsuleContent: '胶囊按钮'
      }
    ],
    items2: [
      {
        title: '列表组',
        arrow: true
      },
      {
        title: '列表组'
      },
      {
        title: '列表组'
      },
      {
        title: '列表组'
      },
      {
        title: '列表组'
      }
    ],
    items3: [
      {
        title: '双行列表',
        brief: '描述信息',
        arrow: true
      }
    ],
    items4: [
      {
        title: '三行列表',
        upperSubtitle: '上副标题',
        lowerSubtitle: '下副标题',
        titlePosition: 'top',
        arrow: true
      },
      {
        title: '三行列表',
        upperSubtitle: '上副标题',
        lowerSubtitle: '下副标题',
        titlePosition: 'middle',
        arrow: true
      },
      {
        title: '三行列表',
        upperSubtitle: '上副标题',
        lowerSubtitle: '下副标题',
        titlePosition: 'bottom',
        arrow: true
      }
    ],
    itemsThumb: [
      {
        thumb: 'https://tfsimg.alipay.com/images/partner/T12rhxXkxcXXXXXXXX',
        title: '标题文字',
        extra: '描述文字',
        arrow: true
      },
      {
        thumb: 'https://tfsimg.alipay.com/images/partner/T12rhxXkxcXXXXXXXX',
        title: '标题文字',
        arrow: true
      },
      {
        thumb: 'https://tfsimg.alipay.com/images/partner/T12rhxXkxcXXXXXXXX',
        title: '标题文字',
        arrow: true
      }
    ],
    itemsThumbMultiple: [
      {
        thumb: 'https://tfsimg.alipay.com/images/partner/T12rhxXkxcXXXXXXXX',
        title: '标题文字',
        brief: '描述信息',
        arrow: true
      },
      {
        thumb: 'https://tfsimg.alipay.com/images/partner/T12rhxXkxcXXXXXXXX',
        title: '标题文字'
      },
      {
        thumb: 'https://tfsimg.alipay.com/images/partner/T12rhxXkxcXXXXXXXX',
        title: '标题文字'
      }
    ],
    items5: [
      {
        thumb:
          'https://gw.alipayobjects.com/zos/rmsportal/KXDIRejMrRdKlSEcLseB.png',
        title: '固定到头部',
        brief: '描述信息',
        arrow: true,
        sticky: true
      },
      {
        title: '标题文字不换行很长很长很长很长很长很长很长很长很长很长',
        arrow: true,
        align: 'middle'
      },
      {
        title: '标题文字换行很长很长很长很长很长很长很长很长很长很长',
        arrow: true,
        align: 'top'
      },
      {
        title:
          '标题文字很长很长很长很长很长很长很长很长很长很长很长很长很长很长',
        extra: '没有箭头',
        align: 'bottom'
      },
      {
        title:
          '标题文字很长很长很长很长很长很长很长很长很长很长很长很长很长很长',
        extra: '子元素垂直对齐',
        align: 'top'
      },
      {
        title: '标题文字换行很长很长很长很长很长很长很长很长很长很长',
        arrow: true
      },
      {
        title:
          '标题文字很长很长很长很长很长很长很长很长很长很长很长很长很长很长',
        extra: '没有箭头'
      },
      {
        title:
          '标题文字很长很长很长很长很长很长很长很长很长很长很长很长很长很长',
        extra: '子元素垂直对齐',
        align: 'top'
      },
      {
        title: '标题文字换行很长很长很长很长很长很长很长很长很长很长',
        arrow: true
      },
      {
        title:
          '标题文字很长很长很长很长很长很长很长很长很长很长很长很长很长很长',
        extra: '没有箭头'
      },
      {
        title:
          '标题文字很长很长很长很长很长很长很长很长很长很长很长很长很长很长',
        extra: '子元素垂直对齐',
        align: 'top'
      },
      {
        title: '标题文字换行很长很长很长很长很长很长很长很长很长很长',
        arrow: true
      },
      {
        title:
          '标题文字很长很长很长很长很长很长很长很长很长很长很长很长很长很长',
        extra: '没有箭头'
      },
      {
        title:
          '标题文字很长很长很长很长很长很长很长很长很长很长很长很长很长很长',
        extra: '子元素垂直对齐',
        align: 'middle'
      }
    ],
    loadMore: '',
    loadContent: ['马不停蹄加载更多数据中...', '-- 已经到底了，加不了咯 --'],
    maxList: 5,
    switchValues: {
      // switch: true,
      // check: false,
    },
    checkValues: {},
    thumb:
      'https://gw-office.alipayobjects.com/basement_prod/47775269-5c8e-40b8-bcda-43380022f311.jpg',
    changeCheckbox: true,
    changeSwitch: true
  },
  onLoad() {
    const charCode = 65
    const charList = []
    for (let i = 0; i < 26; i++) {
      charList.push(String.fromCharCode(charCode + i))
    }
    this.setData({
      alphabet: charList
    })
  },
  onItemClick(ev) {
    if (ev.detail && ev.index === 'check') {
      this.setData({
        actionValues: {
          ...this.data.actionValues,
          [ev.index]: ev.detail.value
        }
      })
    } else {
      my.alert({
        content: `点击了第${ev.index}行`
      })
    }
  },
  onSwitchClick() {
    this.setData({
      changeSwitch: !this.data.changeSwitch
    })
    my.alert({
      content: 'switch changed'
    })
  },
  onCheckClick() {
    this.setData({
      changeCheckbox: !this.data.changeCheckbox
    })
    my.alert({
      content: 'checkbox changed'
    })
  },
  onCapsuleClick() {
    my.alert({
      content: 'capsule button click'
    })
  },
  onScrollToLower() {
    this.setData({
      loadMore: 'load'
    })
    const { items5 } = this.data
    // 加入 maxList 用于判断“假设”数据加载完毕后的情况
    if (this.data.maxList > 0) {
      const newItems = items5.concat(newitems)
      const MAXList = this.data.maxList - 1
      this.setData({
        items5: newItems,
        maxList: MAXList
      })
    } else {
      // 数据加载完毕之后，改变 loadMore 为 over 即可
      this.setData({
        loadMore: 'over'
      })
    }
  },
  onAlphabetClick(ev) {
    my.alert({
      content: JSON.stringify(ev.data)
    })
  }
})
