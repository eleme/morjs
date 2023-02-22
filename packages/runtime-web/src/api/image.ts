import { getParameterError, shouldBeObject } from './utils'

const getImageWH = (path: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    // const oImg: HTMLImageElement = document.getElementById('oImg') as HTMLImageElement;
    const nImg = new Image()
    nImg.onload = () => {
      resolve({
        width: nImg.width,
        height: nImg.height
      })
    }
    nImg.onerror = (error) => {
      reject(error)
    }
    nImg.src = path
  })
}

const getImageSize = (path: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight
      })
    }
    image.onerror = (error) => {
      reject(error)
    }
    image.src = path
  })
}

export default {
  compressImage(): Promise<my.ICompressImageSuccessResult> {
    return new Promise((resolve) => {
      const res: my.ICompressImageSuccessResult = {
        apFilePaths: []
      }
      resolve(res)
    })
  },

  /**
   * 从本地相册选择图片。
   * @param {Object} options 参数
   * @param {number} [options.count=1] 最多可以选择的图片张数
   */
  chooseImage(
    options: PromiseOptions<my.IChooseImageOptions>
  ): Promise<my.IChooseImageSuccessResult> {
    return new Promise((resolve, reject) => {
      const isObject = shouldBeObject(options)
      if (!isObject.res) {
        const res = { errMsg: `chooseImage ${isObject.msg}` }
        console.error(res.errMsg)
        return reject(res)
      }

      const { count = 1 } = options
      const imageId = 'tigaChooseImage'
      const res = {
        errMsg: 'chooseImage:ok',
        tempFilePaths: [],
        apFilePaths: [],
        tempFiles: []
      }

      if (count && typeof count !== 'number') {
        res.errMsg = getParameterError({
          name: 'chooseImage',
          para: 'count',
          correct: 'Number',
          wrong: count
        })
        console.error(res.errMsg)
        return reject(res)
      }

      let tigaChooseImageHandler = document.getElementById(imageId)
      if (!tigaChooseImageHandler) {
        tigaChooseImageHandler = document.createElement('input')
        tigaChooseImageHandler.setAttribute('type', 'file')
        tigaChooseImageHandler.setAttribute('id', imageId)
        if (count > 1) {
          tigaChooseImageHandler.setAttribute('multiple', 'multiple')
        }
        tigaChooseImageHandler.setAttribute('accept', 'image/*')
        tigaChooseImageHandler.setAttribute(
          'style',
          'position: fixed; top: -4000px; left: -3000px; z-index: -300;'
        )
        document.body.appendChild(tigaChooseImageHandler)
      } else {
        if (count > 1) {
          tigaChooseImageHandler.setAttribute('multiple', 'multiple')
        } else {
          tigaChooseImageHandler.removeAttribute('multiple')
        }
      }

      const TigaMouseEvents = document.createEvent('MouseEvents')
      TigaMouseEvents.initEvent('click', true, true)
      tigaChooseImageHandler.dispatchEvent(TigaMouseEvents)
      tigaChooseImageHandler.onchange = function (e) {
        const target = e.target as HTMLInputElement
        const arr = Array.from(target.files)
        arr &&
          arr.forEach((item) => {
            const blob = new Blob([item], {
              type: item.type
            })
            const url = URL.createObjectURL(blob)
            res.tempFilePaths.push(url)
            res.apFilePaths.push(url)
            res.tempFiles.push({
              path: url,
              size: item.size,
              type: item.type,
              originalFileObj: item
            })
          })

        resolve(res)
        target.value = ''
      }
    })
  },

  getImageInfo(
    options: PromiseOptions<my.IGetImageInfoOptions>
  ): Promise<my.IGetImageInfoSuccessResult> {
    const { src } = options
    return new Promise((resolve, reject) => {
      Promise.all([getImageSize(src), getImageWH(src)])
        .then((values) => {
          const sizeInfo = values[0] || {}
          const imageInfo = values[1] || {}
          resolve({
            ...imageInfo,
            size: sizeInfo.size,
            type: sizeInfo.type
          })
        })
        .catch((err) => {
          reject(err)
        })
    })
  },

  saveImage(): Promise<void> {
    return new Promise((resolve) => {
      resolve()
    })
  }
}
