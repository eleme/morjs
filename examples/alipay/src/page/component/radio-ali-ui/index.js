Page({
  data: {
    items: [
      {
        checked: true,
        disabled: false,
        value: 'a',
        desc: '单选框-默认选中',
        id: 'checkbox1'
      },
      {
        checked: false,
        disabled: false,
        value: 'b',
        desc: '单选框-默认未选中',
        id: 'checkbox2'
      }
    ],
    items1: [
      {
        checked: true,
        disabled: true,
        value: 'c',
        desc: '单选框-默认选中disabled',
        id: 'checkbox3'
      }
    ]
  },
  onSubmit(e) {
    my.alert({
      content: e.detail.value.lib
    })
  },
  onReset() {},
  radioChange() {}
})
