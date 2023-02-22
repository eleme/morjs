Page({
  data: {
    modalOpened: false,
    modalOpened2: false,
    modalOpened21: false,
    modalOpened22: false,
    modalOpened222: false,
    modalOpened23: false,
    modalOpened3: false,
    modalOpened4: false,
    modalOpened5: false,
    modalOpened6: false,
    buttons5: [{ text: '取消' }, { text: '主操作', extClass: 'buttonBold' }],
    buttons6: [{ text: '主操作', extClass: 'buttonBold' }, { text: '取消' }],
    buttons7: [
      { text: '取消', extClass: 'cancelBtn' },
      { text: '删除', extClass: 'deleteBtn' }
    ],
    buttons8: [
      { text: '主操作', extClass: 'buttonBold' },
      { text: '更多' },
      { text: '取消' }
    ]
  },
  /* 通用modal */
  openModal() {
    this.setData({
      modalOpened: true
    })
  },
  onModalClick() {
    this.setData({
      modalOpened: false
    })
  },
  onModalClose() {
    this.setData({
      modalOpened: false
    })
  },
  /* 带图弹窗-大图 */
  openModal2() {
    this.setData({
      modalOpened2: true
    })
  },
  onModalClick2() {
    this.setData({
      modalOpened2: false
    })
  },
  onModalClose2() {
    this.setData({
      modalOpened2: false
    })
  },
  /* 带图弹窗 */
  openModal21() {
    this.setData({
      modalOpened21: true
    })
  },
  onModalClick21() {
    this.setData({
      modalOpened21: false
    })
  },
  onModalClose21() {
    this.setData({
      modalOpened21: false
    })
  },
  /* 带图弹窗-小图 */
  openModal22() {
    this.setData({
      modalOpened22: true
    })
  },
  onModalClick22() {
    this.setData({
      modalOpened22: false
    })
  },
  onModalClose22() {
    this.setData({
      modalOpened22: false
    })
  },
  /* 带图弹窗-中图 */
  openModal222() {
    this.setData({
      modalOpened222: true
    })
  },
  onModalClick222() {
    this.setData({
      modalOpened222: false
    })
  },
  onModalClose222() {
    this.setData({
      modalOpened222: false
    })
  },
  /* 带图弹框-关闭icon */
  openModal23() {
    this.setData({
      modalOpened23: true
    })
  },
  onModalClick23() {
    this.setData({
      modalOpened23: false
    })
  },
  onModalClose23() {
    this.setData({
      modalOpened23: false
    })
  },
  /* 运营活动弹框-大 */
  openModal3() {
    this.setData({
      modalOpened3: true
    })
  },
  onModalClick3() {
    this.setData({
      modalOpened3: false
    })
  },
  /* 运营活动弹框-小 */
  openModal4() {
    this.setData({
      modalOpened4: true
    })
  },
  onModalClick4() {
    this.setData({
      modalOpened4: false
    })
  },
  /* 双按钮弹框 */
  openModal5() {
    this.setData({
      modalOpened5: true
    })
  },
  onButtonClick5(e) {
    const {
      target: { dataset }
    } = e
    this.setData({
      modalOpened5: false
    })
    my.alert({
      title: `点击了：${JSON.stringify(dataset)}`,
      buttonText: '关闭'
    })
  },
  /* 双按钮弹框-竖排 */
  openModal6() {
    this.setData({
      modalOpened6: true
    })
  },
  onButtonClick6(e) {
    const {
      target: { dataset }
    } = e
    this.setData({
      modalOpened6: false
    })
    my.alert({
      title: `点击了：${JSON.stringify(dataset)}`,
      buttonText: '关闭'
    })
  },
  /* 弹框自定义按钮样式 */
  openModal7() {
    this.setData({
      modalOpened7: true
    })
  },
  onModalClose7() {
    this.setData({
      modalOpened7: false
    })
  },
  onButtonClick7(e) {
    const {
      target: { dataset }
    } = e
    this.setData({
      modalOpened7: false
    })
    my.alert({
      title: `点击了：${JSON.stringify(dataset)}`,
      buttonText: '关闭'
    })
  },
  /* 三按钮弹框 */
  openModal8() {
    this.setData({
      modalOpened8: true
    })
  },
  onButtonClick8(e) {
    const {
      target: { dataset }
    } = e
    this.setData({
      modalOpened8: false
    })
    my.alert({
      title: `点击了：${JSON.stringify(dataset)}`,
      buttonText: '关闭'
    })
  },
  /* 自定义弹框内容 */
  openModal9() {
    this.setData({
      modalOpened9: true
    })
  },
  onModalClose9() {
    this.setData({
      modalOpened9: false
    })
  }
})
