Page({
  data: {
    title: '按钮操作 Normal',
    subtitle: '',
    disabled: false,
    dataName: '1',
    type: '',
    shape: 'default',
    capsuleSize: 'medium',
    capsuleMinWidth: false,
    showLoading: false,
    types: [
      { name: 'default', value: 'default', checked: true },
      { name: 'primary', value: 'primary' },
      { name: 'ghost', value: 'ghost' },
      { name: 'text', value: 'text' },
      { name: 'warn', value: 'warn' },
      { name: 'warn-ghost', value: 'warn-ghost' },
      { name: 'light', value: 'light' }
    ],
    shapes: [
      { name: 'default', value: 'default', checked: true },
      { name: 'capsule', value: 'capsule' }
    ],
    capsuleSizes: [
      { name: 'small', value: 'small' },
      { name: 'medium', value: 'medium', checked: true },
      { name: 'large', value: 'large' }
    ]
  },
  onLoad() {},
  typeChange(e) {
    this.setData({
      type: e.detail.value
    })
  },
  shapeChange(e) {
    this.setData({
      shape: e.detail.value
    })
  },
  sizeChange(e) {
    this.setData({
      capsuleSize: e.detail.value
    })
  },
  titleChange(e) {
    this.setData({
      title: e.detail.value
    })
  },
  subtitleChange(e) {
    this.setData({
      subtitle: e.detail.value
    })
  },
  onDisableChange(e) {
    this.setData({
      disabled: e.detail.value
    })
  },
  onMinWidthChange(e) {
    this.setData({
      capsuleMinWidth: e.detail.value
    })
  },
  onTest() {
    // e.target.dataset.name
  },
  onLoadingChange(e) {
    this.setData({
      showLoading: e.detail.value
    })
  }
})
