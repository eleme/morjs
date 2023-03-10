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
 * ????????????????????????????????????
 * @param {Object} object ??????
 * @param {string} object.url ????????????????????????
 * @param {string} object.filePath ??????????????????????????????
 * @param {Object} [object.header] HTTP ?????? Header???Header ??????????????? Referer
 * @param {Object} [object.formData] HTTP ???????????????????????? form data
 * @param {string} [object.fileName] ??????????????????
 * @param {string} [object.name] ??????????????? key
 * @param {boolean} [object.withCredentials] ??????xhr???withCredentials???
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
