import example from './example.js'

let imageData
Page({
  onLoad() {
    this.context = my.createCanvasContext('canvas')

    var methods = Object.keys(example)
    this.setData({
      methods: methods
    })

    var that = this
    methods.forEach(function (method) {
      that[method] = function () {
        example[method](that.context)
        that.context.draw()
      }
    })
  },
  log(e) {
    console.log('canvas', e)
  },
  toTempFilePath() {
    this.context.toTempFilePath({
      success(res) {
        my.previewImage({
          urls: [res.apFilePath]
        })
      },
      fail(res) {
        my.alert({
          title: 'toTempFilePath',
          content: `error: ${res.error}`
        })
      }
    })
  },
  preloadCanvasImage() {
    if (my.canIUse('preloadCanvasImage')) {
      var img
      var that = this
      my.preloadCanvasImage({
        urls: [
          'https://gw.alicdn.com/imgextra/i1/O1CN01xjhME61GreRIDjQZD_!!6000000000676-2-tps-199-280.png'
        ],
        success: function (res) {
          img =
            res.loaded[
              'https://gw.alicdn.com/imgextra/i1/O1CN01xjhME61GreRIDjQZD_!!6000000000676-2-tps-199-280.png'
            ]
          that.context.drawImage(img, 0, 0)
          that.context.draw()
        }
      })
    }
  },
  getImageData() {
    this.context.setFillStyle('red')
    this.context.fillRect(10, 10, 150, 100)
    this.context.draw(false, () => {
      this.context.getImageData({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        fail: (error) => {
          console.log(error)
        },
        success: (res) => {
          console.log(res.width) // 100
          console.log(res.height) // 100
          console.log(res.data instanceof Uint8ClampedArray) // true
          console.log(res.data.length) // 100 * 100 * 4
          imageData = res.data
        }
      })
    })
  },

  putImageData() {
    this.context.clearRect(0, 0, 100, 100)
    this.context.draw(true, () => {
      setTimeout(() => {
        this.context.putImageData({
          x: 0,
          y: 0,
          width: 100,
          data: imageData,
          fail: (error) => {
            console.log(error)
          },
          success(xx) {
            console.log('canvasPutImageData', xx)
          }
        })
      }, 2000)
    })
  }
})
