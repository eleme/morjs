const changeToBuffer = (str) => {
  const buffer = new ArrayBuffer(str.length / 2)
  const dataView = new DataView(buffer)
  for (let i = 0; i < str.length; i += 2) {
    dataView.setUint8(i / 2, parseInt(str.substr(i, 2), 16))
  }
  return buffer
}
const changeToHex = (buffer) => {
  const hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('')
}

Page({
  data: {
    devid: '58:59:55:FF:FF:FF', //'0D9C82AD-1CC0-414D-9526-119E08D28124',
    serid: 'FEE7',
    notifyId: '0000FEC8-0000-1000-8000-00805F9B34FB', // '36F6',
    writeId: '36F5',

    name: 'GXETC-XYD220',
    charid: '',
    // name: '',
    alldev: [{ deviceId: '' }]
  },
  //获取本机蓝牙开关状态
  openBluetoothAdapter() {
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log(res)
        if (res.errno !== 0) {
          wx.showModal({ content: '抱歉，您的手机蓝牙暂不可用' })
          return
        }
        wx.showModal({ content: '初始化成功！' })
      },
      fail: (error) => {
        wx.showModal({ content: JSON.stringify(error) })
      }
    })
  },
  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter({
      success: () => {
        wx.showModal({ content: '关闭蓝牙成功！' })
      },
      fail: (error) => {
        wx.showModal({ content: JSON.stringify(error) })
      }
    })
  },
  getBluetoothAdapterState() {
    wx.getBluetoothAdapterState({
      success: (res) => {
        if (!res.available) {
          wx.showModal({ content: '抱歉，您的手机蓝牙暂不可用' })
          return
        }
        wx.showModal({ content: JSON.stringify(res) })
      },
      fail: (error) => {
        wx.showModal({ content: JSON.stringify(error) })
      }
    })
  },
  //扫描蓝牙设备
  startBluetoothDevicesDiscovery() {
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: false,
      success: () => {
        wx.onBluetoothDeviceFound((res) => {
          // wx.showModal({content:'监听新设备'+JSON.stringify(res)});
          var deviceArray = res.devices
          for (var i = deviceArray.length - 1; i >= 0; i--) {
            var deviceObj = deviceArray[i]
            //通过设备名称或者广播数据匹配目标设备，然后记录deviceID后面使用
            if (deviceObj.name == this.data.name) {
              wx.showModal({ content: '目标设备被找到' })
              wx.offBluetoothDeviceFound()
              this.setData({
                deviceId: deviceObj.deviceId
              })
              break
            }
          }
        })
      },
      fail: (error) => {
        wx.showModal({ content: '启动扫描失败' + JSON.stringify(error) })
      }
    })
  },
  //停止扫描
  stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery({
      success: (res) => {
        wx.offBluetoothDeviceFound()
        wx.showModal({ content: '操作成功！' })
      },
      fail: (error) => {
        wx.showModal({ content: JSON.stringify(error) })
      }
    })
  },
  //获取正在连接中的设备
  getConnectedBluetoothDevices() {
    wx.getConnectedBluetoothDevices({
      success: (res) => {
        if (res.devices.length === 0) {
          wx.showModal({ content: '没有在连接中的设备！' })
          return
        }
        wx.showModal({ content: JSON.stringify(res) })
        // devid = res.devices[0].deviceId;
      },
      fail: (error) => {
        wx.showModal({ content: JSON.stringify(error) })
      }
    })
  },

  //获取所有搜索到的设备
  getBluetoothDevices() {
    wx.getBluetoothDevices({
      success: (res) => {
        wx.showModal({ content: JSON.stringify(res) })
      },
      fail: (error) => {
        wx.showModal({ content: JSON.stringify(error) })
      }
    })
  },

  bindKeyInput(e) {
    this.setData({
      devid: e.detail.value
    })
  },

  //连接设备
  connectBLEDevice() {
    wx.createBLEConnection({
      deviceId: this.data.devid,
      success: (res) => {
        wx.showModal({ content: '连接成功' })
      },
      fail: (error) => {
        wx.showModal({ content: JSON.stringify(error) })
      }
    })
  },
  //断开连接
  disconnectBLEDevice() {
    wx.closeBLEConnection({
      deviceId: this.data.devid,
      success: () => {
        wx.showModal({ content: '断开连接成功！' })
      },
      fail: (error) => {
        wx.showModal({ content: JSON.stringify(error) })
      }
    })
  },
  //获取连接设备的server，必须要再连接状态状态之下才能获取
  getBLEDeviceServices() {
    wx.getConnectedBluetoothDevices({
      success: (res) => {
        if (res.devices.length === 0) {
          wx.showModal({ content: '没有已连接的设备' })
          return
        }
        wx.getBLEDeviceServices({
          deviceId: this.data.devid,
          success: (res) => {
            wx.showModal({ content: JSON.stringify(res) })
            console.log('获取设备服务', JSON.stringify(res))

            this.setData({
              serid: '0000FEE7-0000-1000-8000-00805F9B34FB' // res.services[0].serviceId,
            })
          },
          fail: (error) => {
            wx.showModal({ content: JSON.stringify(error) })
          }
        })
      }
    })
  },
  //获取连接设备的charid，必须要再连接状态状态之下才能获取（这里分别筛选出读写特征字）
  getBLEDeviceCharacteristics() {
    wx.getConnectedBluetoothDevices({
      success: (res) => {
        if (res.devices.length === 0) {
          wx.showModal({ content: '没有已连接的设备' })
          return
        }
        // this.setData({
        //   devid: res.devices[0].deviceId,
        // });
        wx.getBLEDeviceCharacteristics({
          deviceId: this.data.devid,
          serviceId: this.data.serid,
          success: (res) => {
            wx.showModal({ content: JSON.stringify(res) })
            //特征字对象属性见文档，根据属性匹配读写特征字并记录，然后后面读写使用
            this.setData({
              charid: res.characteristics[0].uuid
            })
          },
          fail: (error) => {
            wx.showModal({ content: JSON.stringify(error) })
          }
        })
      }
    })
  },
  //读写数据
  readBLECharacteristicValue() {
    wx.getConnectedBluetoothDevices({
      success: (res) => {
        if (res.devices.length === 0) {
          wx.showModal({ content: '没有已连接的设备' })
          return
        }
        this.setData({
          devid: res.devices[0].deviceId
        })
        wx.readBLECharacteristicValue({
          deviceId: this.data.devid,
          serviceId: this.data.serid,
          characteristicId: this.data.notifyId,
          //1、安卓读取服务
          // serviceId:'0000180d-0000-1000-8000-00805f9b34fb',
          // characteristicId:'00002a38-0000-1000-8000-00805f9b34fb',
          success: (res) => {
            wx.showModal({ content: JSON.stringify(res) })
          },
          fail: (error) => {
            wx.showModal({ content: '读取失败' + JSON.stringify(error) })
          }
        })
      }
    })
  },

  writeBLECharacteristicValue() {
    wx.getConnectedBluetoothDevices({
      success: (res) => {
        if (res.devices.length === 0) {
          wx.showModal({ content: '没有已连接的设备' })
          return
        }
        // this.setData({
        //   devid: res.devices[0].deviceId,
        // });

        wx.writeBLECharacteristicValue({
          deviceId: this.data.devid,
          serviceId: this.data.serid,
          characteristicId: this.data.charid,
          //安卓写入服务
          //serviceId:'0000180d-0000-1000-8000-00805f9b34fb',
          //characteristicId:'00002a39-0000-1000-8000-00805f9b34fb',
          value: changeToBuffer('ABCD'),
          success: (res) => {
            wx.showModal({ content: '写入数据成功！' })
          },
          fail: (error) => {
            wx.showModal({ content: JSON.stringify(error) })
          }
        })
      }
    })
  },
  notifyBLECharacteristicValueChange() {
    wx.getConnectedBluetoothDevices({
      success: (res) => {
        if (res.devices.length === 0) {
          wx.showModal({ content: '没有已连接的设备' })
          return
        }
        // this.setData({
        //   devid: res.devices[0].deviceId,
        // });

        wx.notifyBLECharacteristicValueChange({
          state: true,
          deviceId: this.data.devid,
          serviceId: this.data.serid,
          characteristicId: this.data.notifyId,
          success: () => {
            //监听特征值变化的事件
            wx.onBLECharacteristicValueChange((res) => {
              // wx.showModal({content: '特征值变化：'+ JSON.stringify(res)});
              wx.showModal({
                content: '得到响应数据 = ' + changeToHex(res.value)
              })
            })
            wx.showModal({ content: '监听成功' })
          },
          fail: (error) => {
            wx.showModal({ content: '监听失败' + JSON.stringify(error) })
          }
        })
      }
    })
  },
  offBLECharacteristicValueChange() {
    wx.offBLECharacteristicValueChange()
  },
  //其他事件
  bluetoothAdapterStateChange() {
    wx.onBluetoothAdapterStateChange(
      this.getBind('onBluetoothAdapterStateChange')
    )
  },
  onBluetoothAdapterStateChange(res) {
    console.log(res)
    if (res.error) {
      wx.showModal({ content: JSON.stringify(error) })
    } else {
      wx.showModal({ content: '本机蓝牙状态变化：' + JSON.stringify(res) })
    }
  },
  offBluetoothAdapterStateChange() {
    wx.offBluetoothAdapterStateChange(
      this.getBind('onBluetoothAdapterStateChange')
    )
  },
  getBind(name) {
    if (!this[`bind${name}`]) {
      this[`bind${name}`] = this[name].bind(this)
    }
    return this[`bind${name}`]
  },
  BLEConnectionStateChange() {
    wx.onBLEConnectionStateChange(this.getBind('onBLEConnectionStateChange'))
  },
  onBLEConnectionStateChange(res) {
    if (res.error) {
      wx.showModal({ content: JSON.stringify(error) })
    } else {
      wx.showModal({ content: '连接状态变化：' + JSON.stringify(res) })
    }
  },
  offBLEConnectionStateChange() {
    wx.offBLEConnectionStateChange(this.getBind('onBLEConnectionStateChange'))
  },
  onUnload() {
    this.offBLEConnectionStateChange()
    this.offBLECharacteristicValueChange()
    this.offBluetoothAdapterStateChange()
    this.closeBluetoothAdapter()
  }
})
