export default {
  fromAttribute(value) {
    try {
      return JSON.parse(value)
    } catch (e) {
      return value
    }
  }
}
