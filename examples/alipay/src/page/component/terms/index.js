const cfg = {
  c1: {
    related: false,
    agreeBtn: {
      title: '同意协议并开通'
    },
    cancelBtn: {
      title: '暂不开通，仅手动缴费'
    },
    hasDesc: false
  },
  c2: {
    related: false,
    agreeBtn: {
      title: '同意协议并开通'
    },
    hasDesc: true
  },
  c3: {
    related: true,
    agreeBtn: {
      checked: true,
      title: '提交'
    }
  },
  c4: {
    related: true,
    agreeBtn: {
      title: '提交'
    }
  },
  c5: {
    related: false,
    agreeBtn: {
      title: '同意协议并提交'
    }
  },
  c6: {
    related: true,
    fixed: true,
    agreeBtn: {
      checked: true,
      title: '提交'
    }
  }
}

Page({
  data: cfg,
  onLoad() {},
  onSelect(e) {
    const selectedData = e.currentTarget.dataset.name || ''
    selectedData &&
      my.alert({
        title: 'Terms Btns',
        content: selectedData
      })
  }
})
