export const setHeader = (xhr, header) => {
  let headerKey
  for (headerKey in header) {
    xhr.setRequestHeader(headerKey, header[headerKey])
  }
}

/**
 * 将 blob url 转化为文件
 * @param {string} url 要转换为blob的url
 * @returns {Promise<File>}
 */
export const convertObjectUrlToBlob = (url): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.responseType = 'blob'
    xhr.onload = function () {
      if (this.status === 200) {
        resolve(this.response)
      } else {
        reject({ status: this.status })
      }
    }
    xhr.send()
  })
}

export const NETWORK_TIMEOUT = 30000
