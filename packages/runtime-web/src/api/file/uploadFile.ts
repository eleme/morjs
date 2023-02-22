import { createCallbackManager } from '../utils'
import { convertObjectUrlToBlob, NETWORK_TIMEOUT, setHeader } from './utils'

export interface IPromisePlus extends Promise<any> {
  onProgressUpdate: () => void
  abort: () => void
}

const createUploadTask = ({
  name,
  url,
  filePath,
  formData,
  header,
  fileName,
  success,
  error,
  withCredentials
}) => {
  let timeoutInter
  let formKey
  const progressUpdate = createCallbackManager()
  const apiName = 'uploadFile'
  const xhr = new XMLHttpRequest()
  const form = new FormData()

  xhr.open('POST', url)
  if (withCredentials) xhr.withCredentials = true

  setHeader(xhr, header)

  for (formKey in formData) {
    form.append(formKey, formData[formKey])
  }

  xhr.upload.onprogress = (e) => {
    const { loaded, total } = e
    progressUpdate.trigger({
      progress: Math.round((loaded / total) * 100),
      totalBytesSent: loaded,
      totalBytesExpectedToSent: total
    })
  }

  xhr.onload = () => {
    const status = xhr.status
    clearTimeout(timeoutInter)
    success({
      errMsg: `${apiName}:ok`,
      statusCode: status,
      data: xhr.responseText || xhr.response
    })
  }

  xhr.onabort = () => {
    clearTimeout(timeoutInter)
    error({
      errMsg: `${apiName}:fail abort`
    })
  }

  xhr.onerror = () => {
    clearTimeout(timeoutInter)
    error({
      errMsg: `${apiName}:fail fail to upload'}`
    })
  }

  const send = () => {
    xhr.send(form)
    timeoutInter = setTimeout(() => {
      xhr.onabort = null
      xhr.onload = null
      xhr.upload.onprogress = null
      xhr.onreadystatechange = null
      xhr.onerror = null
      abort()
      error({
        errMsg: `${apiName}:fail timeout`
      })
    }, NETWORK_TIMEOUT)
  }

  convertObjectUrlToBlob(filePath)
    .then((fileObj) => {
      form.append(name || 'file', fileObj, fileName || `file-${Date.now()}`)
      send()
    })
    .catch((e) => {
      error({
        errMsg: `${apiName}:fail ${e.message}`
      })
    })

  const abort = () => {
    xhr.abort()
    clearTimeout(timeoutInter)
  }

  return {
    abort,
    onProgressUpdate: progressUpdate.add
  }
}

/**
 * 将本地资源上传到服务器。
 * @param {Object} object 参数
 * @param {string} object.url 开发者服务器地址
 * @param {string} object.filePath 要上传文件资源的路径
 * @param {Object} [object.header] HTTP 请求 Header，Header 中不能设置 Referer
 * @param {Object} [object.formData] HTTP 请求中其他额外的 form data
 * @param {string} [object.fileName] 上传的文件名
 * @param {string} [object.name] 文件对应的 key
 * @param {boolean} [object.withCredentials] 上传xhr的withCredentials值
 * @returns {UploadTask}
 */
const uploadFile = ({
  url,
  filePath,
  header,
  formData,
  fileName,
  name,
  withCredentials
}: my.IUploadFileOptions) => {
  let task
  const promise = new Promise((resolve, reject) => {
    task = createUploadTask({
      url,
      header,
      filePath,
      formData,
      fileName,
      name,
      withCredentials,
      success: (res) => {
        resolve(res)
      },
      error: (res) => {
        reject(res)
      }
    })
  }) as IPromisePlus

  promise.onProgressUpdate = task.onProgressUpdate
  promise.abort = task.abort

  return promise
}

export default uploadFile
