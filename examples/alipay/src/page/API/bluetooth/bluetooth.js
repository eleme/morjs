Page({
  data: {
    devid: '0D9C82AD-1CC0-414D-9526-119E08D28124',
    serid: 'FEE7',
    notifyId: '36F6',
    writeId: '36F5',
    charid: '',
    alldev: [{ deviceId: '' }]
  },
  //获取本机蓝牙开关状态
  openBluetoothAdapter() {
    my.openBluetoothAdapter({
      success: (res) => {
        if (!res.isSupportBLE) {
          my.alert({ content: '抱歉，您的手机蓝牙暂不可用' })
          return
        }
        my.alert({ content: '初始化成功！' })
      },
      fail: (error) => {
        my.alert({ content: JSON.stringify(error) })
      }
    })
  },
  closeBluetoothAdapter() {
    my.closeBluetoothAdapter({
      success: () => {
        my.alert({ content: '关闭蓝牙成功！' })
      },
      fail: (error) => {
        my.alert({ content: JSON.stringify(error) })
      }
    })
  },
  getBluetoothAdapterState() {
    my.getBluetoothAdapterState({
      success: (res) => {
        if (!res.available) {
          my.alert({ content: '抱歉，您的手机蓝牙暂不可用' })
          return
        }
        my.alert({ content: JSON.stringify(res) })
      },
      fail: (error) => {
        my.alert({ content: JSON.stringify(error) })
      }
    })
  },
  //扫描蓝牙设备
  startBluetoothDevicesDiscovery() {
    my.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: false,
      success: () => {
        my.onBluetoothDeviceFound({
          success: (res) => {
            // my.alert({content:'监听新设备'+JSON.stringify(res)});
            var deviceArray = res.devices
            for (var i = deviceArray.length - 1; i >= 0; i--) {
              var deviceObj = deviceArray[i]
              //通过设备名称或者广播数据匹配目标设备，然后记录deviceID后面使用
              if (deviceObj.name == this.data.name) {
                my.alert({ content: '目标设备被找到' })
                my.offBluetoothDeviceFound()
                this.setData({
                  deviceId: deviceObj.deviceId
                })
                break
              }
            }
          },
          fail: (error) => {
            my.alert({ content: '监听新设备失败' + JSON.stringify(error) })
          }
        })
      },
      fail: (error) => {
        my.alert({ content: '启动扫描失败' + JSON.stringify(error) })
      }
    })
  },
  //停止扫描
  stopBluetoothDevicesDiscovery() {
    my.stopBluetoothDevicesDiscovery({
      success: (res) => {
        my.offBluetoothDeviceFound()
        my.alert({ content: '操作成功！' })
      },
      fail: (error) => {
        my.alert({ content: JSON.stringify(error) })
      }
    })
  },
  //获取正在连接中的设备
  getConnectedBluetoothDevices() {
    my.getConnectedBluetoothDevices({
      success: (res) => {
        if (res.devices.length === 0) {
          my.alert({ content: '没有在连接中的设备！' })
          return
        }
        my.alert({ content: JSON.stringify(res) })
        devid = res.devices[0].deviceId
      },
      fail: (error) => {
        my.alert({ content: JSON.stringify(error) })
      }
    })
  },

  //获取所有搜索到的设备
  getBluetoothDevices() {
    my.getBluetoothDevices({
      success: (res) => {
        my.alert({ content: JSON.stringify(res) })
      },
      fail: (error) => {
        my.alert({ content: JSON.stringify(error) })
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
    my.connectBLEDevice({
      deviceId: this.data.devid,
      success: (res) => {
        my.alert({ content: '连接成功' })
      },
      fail: (error) => {
        my.alert({ content: JSON.stringify(error) })
      }
    })
  },
  //断开连接
  disconnectBLEDevice() {
    my.disconnectBLEDevice({
      deviceId: this.data.devid,
      success: () => {
        my.alert({ content: '断开连接成功！' })
      },
      fail: (error) => {
        my.alert({ content: JSON.stringify(error) })
      }
    })
  },
  //获取连接设备的server，必须要再连接状态状态之下才能获取
  getBLEDeviceServices() {
    my.getConnectedBluetoothDevices({
      success: (res) => {
        if (res.devices.length === 0) {
          my.alert({ content: '没有已连接的设备' })
          return
        }
        my.getBLEDeviceServices({
          deviceId: this.data.devid,
          success: (res) => {
            my.alert({ content: JSON.stringify(res) })
            this.setData({
              serid: res.services[0].serviceId
            })
          },
          fail: (error) => {
            my.alert({ content: JSON.stringify(error) })
          }
        })
      }
    })
  },
  //获取连接设备的charid，必须要再连接状态状态之下才能获取（这里分别筛选出读写特征字）
  getBLEDeviceCharacteristics() {
    my.getConnectedBluetoothDevices({
      success: (res) => {
        if (res.devices.length === 0) {
          my.alert({ content: '没有已连接的设备' })
          return
        }
        this.setData({
          devid: res.devices[0].deviceId
        })
        my.getBLEDeviceCharacteristics({
          deviceId: this.data.devid,
          serviceId: this.data.serid,
          success: (res) => {
            my.alert({ content: JSON.stringify(res) })
            //特征字对象属性见文档，根据属性匹配读写特征字并记录，然后后面读写使用
            this.setData({
              charid: res.characteristics[0].characteristicId
            })
          },
          fail: (error) => {
            my.alert({ content: JSON.stringify(error) })
          }
        })
      }
    })
  },
  //读写数据
  readBLECharacteristicValue() {
    my.getConnectedBluetoothDevices({
      success: (res) => {
        if (res.devices.length === 0) {
          my.alert({ content: '没有已连接的设备' })
          return
        }
        this.setData({
          devid: res.devices[0].deviceId
        })
        my.readBLECharacteristicValue({
          deviceId: this.data.devid,
          serviceId: this.data.serid,
          characteristicId: this.data.notifyId,
          //1、安卓读取服务
          // serviceId:'0000180d-0000-1000-8000-00805f9b34fb',
          // characteristicId:'00002a38-0000-1000-8000-00805f9b34fb',
          success: (res) => {
            my.alert({ content: JSON.stringify(res) })
          },
          fail: (error) => {
            my.alert({ content: '读取失败' + JSON.stringify(error) })
          }
        })
      }
    })
  },

  writeBLECharacteristicValue() {
    my.getConnectedBluetoothDevices({
      success: (res) => {
        if (res.devices.length === 0) {
          my.alert({ content: '没有已连接的设备' })
          return
        }
        this.setData({
          devid: res.devices[0].deviceId
        })

        my.writeBLECharacteristicValue({
          deviceId: this.data.devid,
          serviceId: this.data.serid,
          characteristicId: this.data.charid,
          //安卓写入服务
          //serviceId:'0000180d-0000-1000-8000-00805f9b34fb',
          //characteristicId:'00002a39-0000-1000-8000-00805f9b34fb',
          value: 'ABCD',
          success: (res) => {
            my.alert({ content: '写入数据成功！' })
          },
          fail: (error) => {
            my.alert({ content: JSON.stringify(error) })
          }
        })
      }
    })
  },
  notifyBLECharacteristicValueChange() {
    my.getConnectedBluetoothDevices({
      success: (res) => {
        if (res.devices.length === 0) {
          my.alert({ content: '没有已连接的设备' })
          return
        }
        this.setData({
          devid: res.devices[0].deviceId
        })

        my.notifyBLECharacteristicValueChange({
          state: true,
          deviceId: this.data.devid,
          serviceId: this.data.serid,
          characteristicId: this.data.notifyId,
          success: () => {
            //监听特征值变化的事件
            my.onBLECharacteristicValueChange({
              success: (res) => {
                //  my.alert({content: '特征值变化：'+JSON.stringify(res)});
                my.alert({ content: '得到响应数据 = ' + res.value })
              }
            })
            my.alert({ content: '监听成功' })
          },
          fail: (error) => {
            my.alert({ content: '监听失败' + JSON.stringify(error) })
          }
        })
      }
    })
  },
  offBLECharacteristicValueChange() {
    my.offBLECharacteristicValueChange()
  },
  //其他事件
  bluetoothAdapterStateChange() {
    my.onBluetoothAdapterStateChange(
      this.getBind('onBluetoothAdapterStateChange')
    )
  },
  onBluetoothAdapterStateChange() {
    if (res.error) {
      my.alert({ content: JSON.stringify(error) })
    } else {
      my.alert({ content: '本机蓝牙状态变化：' + JSON.stringify(res) })
    }
  },
  offBluetoothAdapterStateChange() {
    my.offBluetoothAdapterStateChange(
      this.getBind('onBluetoothAdapterStateChange')
    )
  },
  getBind(name) {
    if (!this[`bind${name}`]) {
      this[`bind${name}`] = this[name].bind(this)
    }
    return this[`bind${name}`]
  },
  BLEConnectionStateChanged() {
    my.onBLEConnectionStateChanged(this.getBind('onBLEConnectionStateChanged'))
  },
  onBLEConnectionStateChanged(res) {
    if (res.error) {
      my.alert({ content: JSON.stringify(error) })
    } else {
      my.alert({ content: '连接状态变化：' + JSON.stringify(res) })
    }
  },
  offBLEConnectionStateChanged() {
    my.offBLEConnectionStateChanged(this.getBind('onBLEConnectionStateChanged'))
  },
  onUnload() {
    this.offBLEConnectionStateChanged()
    this.offBLECharacteristicValueChange()
    this.offBluetoothAdapterStateChange()
    this.closeBluetoothAdapter()
  }
})
