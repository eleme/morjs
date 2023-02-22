export default {
  createVideoContext(id) {
    return window[`__VIDEO_CONTENT_${id.toUpperCase()}`]
  }
}
