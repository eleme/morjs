import Animation from './animation'

export default {
  createAnimation(config) {
    const animation = new Animation(config)
    return animation
  }
}
