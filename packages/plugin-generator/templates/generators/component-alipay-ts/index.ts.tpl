import { aComponent } from '<%= runtimeName %>'

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
