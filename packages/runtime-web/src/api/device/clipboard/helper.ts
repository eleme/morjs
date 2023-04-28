import select from 'select'

/**
 * Creates a fake textarea element with a value.
 * @param {String} value
 * @return {HTMLElement}
 * @source: copy from https://github.com/zenorocha/clipboard.js/blob/master/src/common/create-fake-element.js
 */

function createFakeElement(value) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl'
  const fakeElement = document.createElement('textarea')
  // Prevent zooming on iOS
  fakeElement.style.fontSize = '12pt'
  // Reset box model
  fakeElement.style.border = '0'
  fakeElement.style.padding = '0'
  fakeElement.style.margin = '0'
  // Move element out of screen horizontally
  fakeElement.style.position = 'absolute'
  fakeElement.style[isRTL ? 'right' : 'left'] = '-9999px'
  // Move element to the same position vertically
  const yPosition = window.pageYOffset || document.documentElement.scrollTop
  fakeElement.style.top = `${yPosition}px`

  fakeElement.setAttribute('readonly', '')
  fakeElement.value = value

  return fakeElement
}

/**
 * Executes a given operation type.
 * @param {String} type
 * @return {Boolean}
 * @source: copy from https://github.com/zenorocha/clipboard.js/blob/master/src/common/command.js
 */
function command(type) {
  try {
    return document.execCommand(type)
  } catch (err) {
    return err
  }
}

const NOT_SUPPORT_COMMAND =
  "your browser doesn't support document.execCommand('copy')."
const isSupportCommandCopy = () => document.queryCommandSupported('copy')

/**
 * Create fake copy action wrapper using a fake element.
 * @param {String} target
 * @param {Object} options
 * @return {String}
 * @source: copy from https://github.com/zenorocha/clipboard.js/blob/master/src/actions/copy.js
 */
export const copy = (value, options) => {
  return new Promise((resolve, reject) => {
    try {
      if (!isSupportCommandCopy()) return reject(NOT_SUPPORT_COMMAND)
      const fakeElement = createFakeElement(value)
      options.container.appendChild(fakeElement)
      const selectedText = select(fakeElement)
      command('copy')
      fakeElement.remove()
      resolve(selectedText)
    } catch (e) {
      reject(e)
    }
  })
}
