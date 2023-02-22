import { aComponent } from '@morjs/core'

aComponent({
  props: {
    text: 'Button',
    onClickMe: () => {}
  },

  methods: {
    onClickMe() {
      this.props.onClickMe()
    }
  }
})
