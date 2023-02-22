Component({
  methods: {
    onItemTap(e) {
      const { onItemTap } = this.props
      const { name } = e.target.dataset
      if (onItemTap) {
        onItemTap({ name })
      }
    }
  }
})
