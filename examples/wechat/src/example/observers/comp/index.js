// index/another_comp.js
Component({
  properties: {
    count: {
      type: Number,
      observer: function (value) {
        console.error(
          '--properties observer count--',
          value,
          this.data,
          this.properties
        )
      }
    }
  },
  observers: {
    count: function (count) {
      console.log('--observers count--', count)
    }
  },
  deriveDataFromProps() {
    console.log('--deriveDataFromProps--')
  },
  lifetimes: {
    // 在组件实例刚刚被创建时执行。
    created() {
      console.log('created')
    },
    // 在组件实例进入页面节点树时执行。
    attached() {
      console.log('attached')
    },
    // 在组件在视图层布局完成后执行。
    ready() {
      console.log('ready')
    }
  },
  methods: {}
})
