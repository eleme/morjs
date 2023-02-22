Page({
  data: {
    items: [
      {
        dot: true,
        text: '',
        isWrap: true,
        intro: 'Dot Badge'
      },
      {
        dot: false,
        text: 1,
        isWrap: true,
        intro: 'Text Badge'
      },
      {
        dot: false,
        text: 99,
        isWrap: false,
        intro: '数字'
      },
      {
        dot: false,
        text: 100,
        overflowCount: 99,
        isWrap: false,
        intro: '数字超过overflowCount'
      },
      {
        dot: false,
        text: 'new',
        isWrap: false,
        intro: '文字'
      },
      {
        dot: false,
        text: '22222222222222',
        isWrap: false,
        intro: '箭头中',
        withArrow: true,
        direction: 'middle'
      },
      {
        dot: false,
        text: 'left arrow',
        isWrap: false,
        intro: '箭头左',
        withArrow: true,
        direction: 'left'
      },
      {
        dot: false,
        text: 'right arrow',
        isWrap: false,
        intro: '箭头右',
        withArrow: true,
        direction: 'right'
      }
    ]
  }
})
