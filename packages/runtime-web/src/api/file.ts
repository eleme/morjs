export default {
  getFileInfo(): Promise<my.IGetFileInfoSuccessResult> {
    return new Promise((resolve) => {
      const res: my.IGetFileInfoSuccessResult = {
        size: 0,
        digest: ''
      }
      resolve(res)
    })
  },

  getSavedFileInfo(): Promise<my.IGetSavedFileInfoSuccessResult> {
    return new Promise((resolve) => {
      const res: my.IGetSavedFileInfoSuccessResult = {
        errMsg: '',
        createTime: 0,
        size: 0
      }
      resolve(res)
    })
  },

  getSavedFileList(): Promise<my.IGetSavedFileListSuccessResult> {
    return new Promise((resolve) => {
      const res: my.IGetSavedFileListSuccessResult = {
        errMsg: '',
        fileList: []
      }
      resolve(res)
    })
  },

  openDocument(): Promise<my.IGetSavedFileListSuccessResult> {
    return new Promise((resolve) => {
      const res: my.IGetSavedFileListSuccessResult = {
        errMsg: '',
        fileList: []
      }
      resolve(res)
    })
  },

  removeSavedFile(): Promise<void> {
    return new Promise((resolve) => {
      resolve()
    })
  },

  saveFile(): Promise<my.ISaveFileSuccessResult> {
    return new Promise((resolve) => {
      const res: my.ISaveFileSuccessResult = {
        savedFilePath: ''
      }
      resolve(res)
    })
  }
}
