import './action-sheet/index'
import './alert'
import './confirm/index'
import './loading'
import './preview-image/index'
import './prompt/index'
import './toast/index'

let currentLoadingElment: HTMLElement
let currentToastElement: HTMLElement
let currentToastTimeId = null

const setAttributes = (element, attributes) => {
  const whiteList = ['success', 'fail', 'compelte']
  const keys = Object.keys(attributes)

  keys.forEach((key) => {
    if (whiteList.indexOf(key) > -1) return

    let value = attributes[key]
    if (typeof value === 'object') value = JSON.stringify(value)
    value && element.setAttribute(key, value)
  })
}

export default {
  previewImage(options): Promise<void> {
    const { urls, current } = options
    return new Promise((resolve, reject) => {
      try {
        const el = document.createElement('private-preview-image')
        urls &&
          el.setAttribute(
            'urls',
            typeof urls === 'object' ? JSON.stringify(urls) : urls
          )
        current && el.setAttribute('current', current)
        document.body.appendChild(el)
        el.addEventListener('close', () => {
          document.body.removeChild(el)
          resolve()
        })
      } catch (error) {
        reject()
      }
    })
  },

  alert({ title, content, buttonText }) {
    return new Promise((resolve) => {
      const el = document.createElement('private-alert')
      title && el.setAttribute('title', title)
      content &&
        el.setAttribute(
          'content',
          typeof content === 'object' ? JSON.stringify(content) : content
        )
      buttonText && el.setAttribute('buttonText', buttonText)
      document.body.appendChild(el)
      el.addEventListener('close', () => {
        document.body.removeChild(el)
        return resolve(undefined)
      })
    })
  },
  showLoading({ content, delay }) {
    const createLoading = function () {
      new Promise((resolve) => {
        if (currentLoadingElment)
          document.body.removeChild(currentLoadingElment)

        currentLoadingElment = document.createElement('private-loading')
        content && currentLoadingElment.setAttribute('content', content)
        document.body.appendChild(currentLoadingElment)
        return resolve(undefined)
        // el.addEventListener('close', () => {
        //   document.body.removeChild(el);
        //   resolve();
        // });
      })
    }

    const d = delay ? parseInt(delay) : 0
    if (d > 0) {
      return new Promise((resolve) => {
        setTimeout(() => {
          return resolve(undefined)
        }, d)
      }).then(() => createLoading())
    } else {
      return createLoading()
    }
  },
  hideLoading() {
    return new Promise((resolve) => {
      document.body.removeChild(currentLoadingElment)
      currentLoadingElment = null
      return resolve(undefined)
    })
  },
  showToast({ content, type, duration = 3000 }) {
    if (currentToastElement) return
    return new Promise((resolve, reject) => {
      try {
        currentToastElement = document.createElement('private-toast')
        content && currentToastElement.setAttribute('content', content)
        type && currentToastElement.setAttribute('type', type)

        document.body.appendChild(currentToastElement)
        currentToastTimeId = setTimeout(() => {
          document.body.removeChild(currentToastElement)
          currentToastElement = null
          return resolve(undefined)
        }, duration)
      } catch (e) {
        currentToastElement = null
        return reject(`${e}`)
      }
    })
  },
  hideToast() {
    return new Promise((resolve, reject) => {
      try {
        if (!currentToastElement) return resolve(undefined)

        document.body.removeChild(currentToastElement)
        currentToastElement = null
        clearTimeout(currentToastTimeId)
        return resolve(undefined)
      } catch (e) {
        return reject(`${e}`)
      }
    })
  },
  confirm(attributes) {
    const createConfirm = () => {
      const el = document.createElement('private-confirm')

      setAttributes(el, attributes)
      document.body.appendChild(el)

      return el
    }

    return new Promise((resolve, reject) => {
      try {
        const confirmEle = createConfirm()
        confirmEle.addEventListener('select', (event: any) => {
          event.stopPropagation()
          document.body.removeChild(confirmEle)
          resolve(event && event.detail)
        })
      } catch (e) {
        reject(`${e}`)
      }
    })
  },
  prompt(attributes) {
    const createPrompt = () => {
      const el = document.createElement('private-prompt')
      setAttributes(el, attributes)
      document.body.appendChild(el)
      return el
    }

    return new Promise((resolve, reject) => {
      try {
        const promptEle = createPrompt()
        promptEle.addEventListener('select', (event: any) => {
          event.stopPropagation()
          document.body.removeChild(promptEle)
          resolve(event && event.detail)
        })
      } catch (e) {
        reject(`${e}`)
      }
    })
  },
  showActionSheet(attributes) {
    const createActionSheet = () => {
      const el = document.createElement('private-action-sheet')
      setAttributes(el, attributes)
      document.body.appendChild(el)
      return el
    }

    return new Promise((resolve, reject) => {
      try {
        const actionSheet = createActionSheet()
        actionSheet.addEventListener('select', (event: any) => {
          event.stopPropagation()
          document.body.removeChild(actionSheet)
          resolve(event && event.detail)
        })
      } catch (e) {
        reject(`${e}`)
      }
    })
  }
}
