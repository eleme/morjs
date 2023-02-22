Page({
  data: {
    compressedSrc: '',
    mode: 'aspectFit'
  },
  selectImage() {
    my.chooseImage({
      count: 1,
      success: (res) => {
        my.compressImage({
          apFilePaths: res.apFilePaths,
          level: 1,
          success: (data) => {
            console.log(data)
            this.setData({
              compressedSrc: data.apFilePaths[0]
            })
          }
        })
      }
    })
  }
})
