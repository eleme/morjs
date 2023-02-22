/* eslint-disable no-var */
/* eslint-disable prefer-rest-params */
export default function polyfill() {
  // aliases
  var w = window
  var d = document

  // return if scroll behavior
  if (
    'scrollBehavior' in d.documentElement.style ||
    (w as any).__injectTigaSmoothBehaviorPolyfill
  ) {
    return
  }

  ;(w as any).__injectTigaSmoothBehaviorPolyfill = true

  // globals
  var Element = w.HTMLElement || w.Element
  var SCROLL_TIME = 468

  // object gathering original scroll methods
  var original = {
    scroll: w.scroll || w.scrollTo,
    elementScroll: Element.prototype.scroll || scrollElement
  }

  // define timing method
  var now =
    w.performance && w.performance.now
      ? w.performance.now.bind(w.performance)
      : Date.now

  /**
   * indicates if a the current browser is made by Microsoft
   * @method isMicrosoftBrowser
   * @param {String} userAgent
   * @returns {Boolean}
   */
  function isMicrosoftBrowser(userAgent) {
    var userAgentPatterns = ['MSIE ', 'Trident/', 'Edge/']

    return new RegExp(userAgentPatterns.join('|')).test(userAgent)
  }

  /*
   * IE has rounding bug rounding down clientHeight and clientWidth and
   * rounding up scrollHeight and scrollWidth causing false positives
   * on hasScrollableSpace
   */
  var ROUNDING_TOLERANCE = isMicrosoftBrowser(w.navigator.userAgent) ? 1 : 0

  /**
   * changes scroll position inside an element
   * @method scrollElement
   * @param {Number} x
   * @param {Number} y
   * @returns {undefined}
   */
  function scrollElement(x, y) {
    this.scrollLeft = x
    this.scrollTop = y
  }

  /**
   * returns result of applying ease math function to a number
   * @method ease
   * @param {Number} k
   * @returns {Number}
   */
  function ease(k) {
    return 0.5 * (1 - Math.cos(Math.PI * k))
  }

  /**
   * indicates if a smooth behavior should be applied
   * @method shouldBailOut
   * @param {Number|Object} firstArg
   * @returns {Boolean}
   */
  function shouldBailOut(firstArg) {
    if (
      firstArg === null ||
      typeof firstArg !== 'object' ||
      firstArg.behavior === undefined ||
      firstArg.behavior === 'auto' ||
      firstArg.behavior === 'instant'
    ) {
      // first argument is not an object/null
      // or behavior is auto, instant or undefined
      return true
    }

    if (typeof firstArg === 'object' && firstArg.behavior === 'smooth') {
      // first argument is an object and behavior is smooth
      return false
    }

    // throw error when behavior is not supported
    throw new TypeError(
      'behavior member of ScrollOptions ' +
        firstArg.behavior +
        ' is not a valid value for enumeration ScrollBehavior.'
    )
  }

  function step(context) {
    var time = now()
    var value
    var currentX
    var currentY
    var elapsed = (time - context.startTime) / SCROLL_TIME

    // avoid elapsed times higher than one
    elapsed = elapsed > 1 ? 1 : elapsed

    // apply easing to elapsed time
    value = ease(elapsed)

    currentX = context.startX + (context.x - context.startX) * value
    currentY = context.startY + (context.y - context.startY) * value

    context.method.call(context.scrollable, currentX, currentY)

    // scroll more if we have not reached our destination
    if (currentX !== context.x || currentY !== context.y) {
      w.requestAnimationFrame(step.bind(w, context))
    }
  }

  /**
   * scrolls window or element with a smooth behavior
   * @method smoothScroll
   * @param {Object|Node} el
   * @param {Number} x
   * @param {Number} y
   * @returns {undefined}
   */
  function smoothScroll(el, x, y) {
    var scrollable
    var startX
    var startY
    var method
    var startTime = now()

    // define scroll context
    if (el === d.body) {
      scrollable = w
      startX = w.scrollX || w.pageXOffset
      startY = w.scrollY || w.pageYOffset
      method = original.scroll
    } else {
      scrollable = el
      startX = el.scrollLeft
      startY = el.scrollTop
      method = scrollElement
    }

    // scroll looping over a frame
    step({
      scrollable: scrollable,
      method: method,
      startTime: startTime,
      startX: startX,
      startY: startY,
      x: x,
      y: y
    })
  }

  // ORIGINAL METHODS OVERRIDES
  // w.scroll and w.scrollTo
  w.scrollTo = function () {
    // avoid action when no arguments are passed
    if (arguments[0] === undefined) {
      return
    }

    // avoid smooth behavior if not required
    if (shouldBailOut(arguments[0]) === true) {
      original.scroll.call(
        w,
        arguments[0].left !== undefined
          ? arguments[0].left
          : typeof arguments[0] !== 'object'
          ? arguments[0]
          : w.scrollX || w.pageXOffset,
        // use top prop, second argument if present or fallback to scrollY
        arguments[0].top !== undefined
          ? arguments[0].top
          : arguments[1] !== undefined
          ? arguments[1]
          : w.scrollY || w.pageYOffset
      )

      return
    }

    // LET THE SMOOTHNESS BEGIN!
    smoothScroll.call(
      w,
      d.body,
      arguments[0].left !== undefined
        ? ~~arguments[0].left
        : w.scrollX || w.pageXOffset,
      arguments[0].top !== undefined
        ? ~~arguments[0].top
        : w.scrollY || w.pageYOffset
    )
  }

  // Element.prototype.scroll and Element.prototype.scrollTo
  Element.prototype.scrollTo = function () {
    // avoid action when no arguments are passed
    if (arguments[0] === undefined) {
      return
    }

    // avoid smooth behavior if not required
    if (shouldBailOut(arguments[0]) === true) {
      // if one number is passed, throw error to match Firefox implementation
      if (typeof arguments[0] === 'number' && arguments[1] === undefined) {
        throw new SyntaxError('Value could not be converted')
      }

      original.elementScroll.call(
        this,
        // use left prop, first number argument or fallback to scrollLeft
        arguments[0].left !== undefined
          ? ~~arguments[0].left
          : typeof arguments[0] !== 'object'
          ? ~~arguments[0]
          : this.scrollLeft,
        // use top prop, second argument or fallback to scrollTop
        arguments[0].top !== undefined
          ? ~~arguments[0].top
          : arguments[1] !== undefined
          ? ~~arguments[1]
          : this.scrollTop
      )

      return
    }

    var left = arguments[0].left
    var top = arguments[0].top

    // LET THE SMOOTHNESS BEGIN!
    smoothScroll.call(
      this,
      this,
      typeof left === 'undefined' ? this.scrollLeft : ~~left,
      typeof top === 'undefined' ? this.scrollTop : ~~top
    )
  }
}
