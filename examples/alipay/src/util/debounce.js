export default function debounce(fn, wait) {
  var timeout
  return function () {
    var ctx = this,
      args = arguments
    clearTimeout(timeout)
    timeout = setTimeout(function () {
      fn.apply(ctx, args)
    }, wait)
  }
}
