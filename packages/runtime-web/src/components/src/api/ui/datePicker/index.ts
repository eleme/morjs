import './picker/index'

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
  datePicker(attributes) {
    const createDatePicker = () => {
      const el = document.createElement('private-date-picker')

      setAttributes(el, attributes)
      document.body.appendChild(el)
      return el
    }

    return new Promise((resolve, reject) => {
      try {
        const datePicker = createDatePicker()
        datePicker.addEventListener('select', (event: any) => {
          event.stopPropagation()
          document.body.removeChild(datePicker)
          resolve(event && event.detail)
        })

        datePicker.addEventListener('cancel', (event) => {
          event.stopPropagation()
        })
      } catch (e) {
        reject(`${e}`)
      }
    })
  }
}
