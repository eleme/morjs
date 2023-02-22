Page({
  download() {
    my.downloadFile({
      url: 'https://img.alicdn.com/tfs/TB1x669SXXXXXbdaFXXXXXXXXXX-520-280.jpg',
      success({ apFilePath }) {
        my.previewImage({
          urls: [apFilePath]
        })
      },
      fail(res) {
        my.alert({
          content: res.errorMessage || res.error
        })
      }
    })
  }
})
