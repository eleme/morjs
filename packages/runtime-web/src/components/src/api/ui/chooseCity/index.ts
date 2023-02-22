import './chooseCity'

export default {
  chooseCity(options) {
    const { success, complete } = options || {}

    const createChooseCity = () => {
      const el = document.createElement('private-choose-city')

      setTimeout(() => {
        document.body.appendChild(el)
      }, 0)

      return el
    }

    const chooseCity = createChooseCity()

    chooseCity.addEventListener('choose', (event: any) => {
      event.stopPropagation()

      document.body.removeChild(chooseCity)

      success && success(event && event.detail)
      complete && complete(event && event.detail)
    })

    chooseCity.addEventListener('close', (event) => {
      event.stopPropagation()

      document.body.removeChild(chooseCity)
    })
  },
  onLocatedComplete(options) {
    const { complete } = options || {}
    complete && complete()
  },
  setLocatedCity(options) {
    const { complete } = options || {}
    complete && complete()
  },
  regionPicker(options) {
    const { complete } = options || {}
    complete && complete()
  }
}
