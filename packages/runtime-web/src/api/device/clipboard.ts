const isSupport = () => typeof navigator.clipboard === 'object'
const reject = () => Promise.reject('your browser not support clipboard api!')

export default {
  setClipboard({ text = '' }) {
    if (!isSupport()) return reject()

    return navigator.clipboard.writeText(text)
  },

  getClipboard() {
    if (!isSupport()) return reject()

    return navigator.clipboard.readText().then((text) => ({ text }))
  }
}
