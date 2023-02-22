export default function (options) {
  const { src, success, fail, complete } = options
  const script = document.createElement('script')
  script.setAttribute('type', 'text/javascript')
  script.setAttribute('src', src)
  script.onload = function () {
    success && success()
    complete && complete()
  }
  script.onerror = function () {
    fail && fail()
    complete && complete()
  }
  document.head.appendChild(script)
}
