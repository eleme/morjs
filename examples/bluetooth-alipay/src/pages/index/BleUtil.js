import DataUtil from './DataUtil'
var StateCode = {
  0: '成功',
  1: '失败',
  2: '蓝牙错误',
  3: '打开蓝牙适配器失败',
  4: '开启搜索附近蓝牙设备失败',
  5: '连接蓝牙设备失败',
  6: '遍历服务失败',
  7: '业务服务不存在',
  8: '遍历特征失败',
  9: '业务员特征不存在',
  10: '监听数据失败',
  11: '接收数据包头帧数据格式错误',
  12: '接收帧数据长度越界',
  13: 'auth response 失败',
  14: 'init response 失败',
  15: '数据帧协议长度异常',
  16: 'protobuf协议数据长度异常',
  17: '头包CTL数据异常',
  18: 'BCC校验失败',
  19: '蓝牙发送数据失败',
  20: '初始化设备失败',
  100: '超时'
}
var ScanTimer
var ScanFlagName = 'ETC'
var DeviceId
var ConnectTimer
var ConnectCall = false
var ConnectCallback
var ServiceId
var ReadId
var WriteId
var PacketData = ''
var PacketDataLength = 0
var PacketArray = new Array()
var PacketArrayLength = 0
var SendTimer
var SendCall = false
var SendCallback
var SendDatas = new Array()
var SendIndex = 0
var InitDeviceCount = 2
var deviceName = ''

function closeObu(callback) {
  clearTimeout(ScanTimer) //清空之前的搜索超时定时器
  // clearTimeout(ConnectTimer) //清空连接超时定时器
  sendAndReceive(
    DataUtil.makeA5SendData('C3'),
    (code, data) => {
      if (code == 0 || code == 100) {
        console.log('关闭成功')
      } else {
        console.log('关闭失败')
      }
      callback && callback()
    },
    3000
  )
}

function closeBLEConnection(deviceId, callback, failCallBack) {
  clearTimeout(ScanTimer) //清空之前的搜索超时定时器
  // clearTimeout(ConnectTimer) //清空连接超时定时器
  my.disconnectBLEDevice({
    deviceId: deviceId, // 蓝牙设备id
    success: (res) => {
      console.log('关闭连接成功')
      callback && callback(res)
    },
    fail: (res) => {
      console.log('关闭连接失败')
      failCallBack && failCallBack(res)
    }
  })
}
/**
 * 搜索设备
 */
var ScanBleDevice = function (callback, timeout) {
  clearTimeout(ScanTimer) //清空之前的搜索超时定时器
  var FoundDevice = [] //刷新搜索设备数组
  my.offBluetoothDeviceFound() //关闭之前的监听
  console.log('开启蓝牙适配器')
  my.openBluetoothAdapter({
    success: (res) => {
      console.log('监听搜索新设备响应')
      console.log(res)
      my.onBluetoothDeviceFound((res) => {
        console.log('::监听搜索新设备响应 onBluetoothDeviceFound')
        console.log(res)
        for (let i = 0; i < res.devices.length; i++) {
          let haveDevice = false
          let newDevice = res.devices[i]
          for (let j = 0; j < FoundDevice.length; j++) {
            let oldDevice = FoundDevice[i]
            if (newDevice.deviceId == oldDevice.deviceId) {
              haveDevice = true
              break
            }
          }
          if (!haveDevice) {
            console.log(newDevice)
            FoundDevice.push(newDevice)
            if (
              (newDevice.localName &&
                newDevice.localName.indexOf(ScanFlagName) > -1) ||
              (newDevice.name && newDevice.name.indexOf(ScanFlagName) > -1) ||
              (newDevice.deviceName &&
                (newDevice.deviceName.indexOf('NM') > -1 ||
                  newDevice.deviceName.indexOf('ETC') > -1))
            ) {
              deviceName = newDevice.deviceName
              my.offBluetoothDeviceFound()
              my.stopBluetoothDevicesDiscovery({
                success: function (retu_data) {
                  console.log('停止扫描，开始连接')
                  typeof callback == 'function' && callback(0, newDevice)
                }
              })
            }
          }
        }
      })
      console.log('开始搜索设备')
      my.startBluetoothDevicesDiscovery({
        success: (res) => {
          console.log('开启搜索设备成功')
          let ScanTimeout = 15 * 1000
          if (typeof timeout == 'number' && timeout > 0) {
            ScanTimeout = timeout
          }
          ScanTimer = setTimeout(() => {
            my.stopBluetoothDevicesDiscovery({
              success: (res) => {
                console.log('搜索超时，停止搜索附近设备')
              }
            })
            typeof callback == 'function' && callback(100, null)
          }, ScanTimeout)
        },
        fail: (res) => {
          typeof callback == 'function' && callback(4, res)
        }
      })
    },
    fail: (res) => {
      typeof callback == 'function' && callback(3, res)
    }
  })
}

/**
 * 连接设备
 */
var ConnectBleDevice = function (deviceId, callback, timeout) {
  if (ConnectCall) {
    return
  }
  InitDeviceCount = 2
  DeviceId = deviceId
  ConnectCall = true
  ConnectCallback = callback
  clearTimeout(ScanTimer) //清空搜索超时定时器
  clearTimeout(ConnectTimer) //清空连接超时定时器
  ServiceId = null
  ReadId = null
  WriteId = null
  my.stopBluetoothDevicesDiscovery({
    success: (res) => {
      console.log('连接设备，停止搜索附近设备')
    }
  })
  my.offBLEConnectionStateChanged()
  console.log('监听蓝牙设备连接状态变化')
  my.onBLEConnectionStateChanged((res) => {
    console.log(
      '设备ID（' + res.deviceId + '），连接状态变化，是否连接：' + res.connected
    )
  })
  //连接超时定时器
  let ConnectTimeout = 60 * 1000
  if (typeof timeout == 'number' && timeout > 0) {
    ConnectTimeout = timeout
  }
  ConnectTimer = setTimeout(() => {
    my.disconnectBLEDevice({
      deviceId: DeviceId, // 蓝牙设备id
      success: (res) => {
        console.log('连接流程超时，断开连接设备')
      }
    })
    if (ConnectCall) {
      ConnectCall = false
      typeof callback == 'function' && callback(100, null)
    }
  }, ConnectTimeout)
  console.log('开始连接蓝牙设备')
  my.connectBLEDevice({
    deviceId: deviceId, // 蓝牙设备id
    success: (res) => {
      console.log('连接建立，开始遍历设备业务服务')
      my.getBLEDeviceServices({
        deviceId: deviceId, // 蓝牙设备 id，参考 device 对象
        success: (res) => {
          console.log('获取设备业务getBLEDeviceServices:', res)
          for (let i = 0; i < res.services.length; i++) {
            let service = res.services[i]
            if (
              service.serviceId.toUpperCase() == 'FEE7' ||
              service.serviceId.toUpperCase() ==
                '0000FEE7-0000-1000-8000-00805F9B34FB'
            ) {
              ServiceId = service.serviceId
              break
            }
          }
          if (typeof ServiceId == 'string') {
            console.log('业务服务存在，开始遍历设备业务特征')
            my.getBLEDeviceCharacteristics({
              deviceId: deviceId, // 蓝牙设备 id，参考 device 对象
              serviceId: ServiceId, // 蓝牙特征值对应 service 的 uuid
              success: (res) => {
                console.log(JSON.stringify(res))
                for (let i = 0; i < res.characteristics.length; i++) {
                  let characteristic = res.characteristics[i]
                  if (
                    characteristic.characteristicId.toUpperCase() == 'FEC7' ||
                    characteristic.characteristicId.toUpperCase() ==
                      '0000FEC7-0000-1000-8000-00805F9B34FB'
                  ) {
                    WriteId = characteristic.characteristicId
                  } else if (
                    characteristic.characteristicId.toUpperCase() == 'FEC8' ||
                    characteristic.characteristicId.toUpperCase() ==
                      '0000FEC8-0000-1000-8000-00805F9B34FB'
                  ) {
                    ReadId = characteristic.characteristicId
                  }
                }
                if (typeof ReadId == 'string' && typeof WriteId == 'string') {
                  console.log('遍历完成，开始监听数据')
                  my.offBLECharacteristicValueChange()
                  my.onBLECharacteristicValueChange({
                    success: GetCharacteristicValue
                  })
                  my.notifyBLECharacteristicValueChange({
                    deviceId: deviceId, // 蓝牙设备 id，参考 device 对象
                    serviceId: ServiceId, // 蓝牙特征值对应 service 的 uuid
                    characteristicId: ReadId, // 蓝牙特征值的 uuid
                    success: (res) => {
                      console.log('监听数据成功，开始微信协议握手')
                      // my.onBLECharacteristicValueChange({
                      //   success:GetCharacteristicValue
                      // });
                    },
                    fail: (res) => {
                      clearTimeout(ConnectTimer)
                      if (ConnectCall) {
                        ConnectCall = false
                        my.disconnectBLEDevice({
                          deviceId: DeviceId, // 蓝牙设备id
                          success: (res) => {
                            console.log('监听数据失败，断开连接设备')
                          }
                        })
                        typeof callback == 'function' && callback(10, res)
                      }
                    }
                  })
                } else {
                  clearTimeout(ConnectTimer)
                  my.disconnectBLEDevice({
                    deviceId: DeviceId, // 蓝牙设备id
                    success: (res) => {
                      console.log('业务特征不存在，断开连接设备')
                    }
                  })
                  if (ConnectCall) {
                    ConnectCall = false
                    typeof callback == 'function' && callback(9, null)
                  }
                }
              },
              fail: (res) => {
                clearTimeout(ConnectTimer)
                my.disconnectBLEDevice({
                  deviceId: DeviceId, // 蓝牙设备id
                  success: (res) => {
                    console.log('遍历特征失败，断开连接设备')
                  }
                })
                if (ConnectCall) {
                  ConnectCall = false
                  typeof callback == 'function' && callback(8, res)
                }
              }
            })
          } else {
            clearTimeout(ConnectTimer)
            my.disconnectBLEDevice({
              deviceId: DeviceId, // 蓝牙设备id
              success: (res) => {
                console.log('业务服务不存在，断开连接设备')
              }
            })
            if (ConnectCall) {
              ConnectCall = false
              typeof callback == 'function' && callback(7, null)
            }
          }
        },
        fail: (res) => {
          clearTimeout(ConnectTimer)
          my.disconnectBLEDevice({
            deviceId: DeviceId, // 蓝牙设备id
            success: (res) => {
              console.log('遍历服务失败，断开连接设备')
            }
          })
          if (ConnectCall) {
            ConnectCall = false
            typeof callback == 'function' && callback(6, res)
          }
        }
      })
    },
    fail: (res) => {
      clearTimeout(ConnectTimer)
      if (ConnectCall) {
        ConnectCall = false
        typeof callback == 'function' && callback(5, res)
      }
    }
  })
}

/**
 * 接收到数据
 */
var GetCharacteristicValue = function (res) {
  let data = res.value
  console.log('接收：' + data)
  if (PacketData.length == 0) {
    if (data.toUpperCase().startsWith('FE01') && data.length >= 16) {
      PacketDataLength = parseInt(data.slice(4, 8), 16) * 2
    } else {
      clearTimeout(SendTimer)
      if (SendCall) {
        SendCall = false
        typeof SendCallback == 'function' && SendCallback(11, null)
      }
      return
    }
  }
  PacketData += data
  if (PacketData.length < PacketDataLength) {
    return
  }
  if (PacketData.length > PacketDataLength) {
    PacketData = ''
    PacketDataLength = 0
    clearTimeout(SendTimer)
    if (SendCall) {
      SendCall = false
      typeof SendCallback == 'function' && SendCallback(12, null)
    }
    return
  }
  let cmdId = PacketData.slice(8, 12)
  if (cmdId == '2711') {
    console.log('Auth握手数据：' + PacketData)
    PacketData = ''
    PacketDataLength = 0
    sendAndReceive(
      DataUtil.makeAuthResponse(),
      (code, res) => {
        console.log(code, res)
        if (code != 0) {
          clearTimeout(ConnectTimer)
          my.disconnectBLEDevice({
            deviceId: DeviceId, // 蓝牙设备id
            success: (res) => {
              console.log('auth response 失败，断开连接设备')
            }
          })
          if (ConnectCall) {
            ConnectCall = false
            typeof callback == 'function' && callback(13, res)
          }
        }
      },
      3000
    )
  } else if (cmdId == '2713') {
    clearTimeout(SendTimer)
    if (SendCall) {
      SendCall = false
      typeof SendCallback == 'function' && SendCallback(0, null)
    }
    console.log('Init握手数据：' + PacketData)
    PacketData = ''
    PacketDataLength = 0
    sendAndReceive(
      DataUtil.makeInitResponse(),
      (code, res) => {
        console.log(code, res)
        if (code == 0 || code == 100) {
          initDevice()
        } else {
          clearTimeout(ConnectTimer)
          my.disconnectBLEDevice({
            deviceId: DeviceId, // 蓝牙设备id
            success: (res) => {
              console.log('init response 失败，断开连接设备')
            }
          })
          if (ConnectCall) {
            ConnectCall = false
            typeof callback == 'function' && callback(14, res)
          }
        }
      },
      3000
    )
  } else if (cmdId == '2712') {
    if (PacketData.length < 36) {
      let errData = PacketData
      PacketData = ''
      PacketDataLength = 0
      clearTimeout(SendTimer)
      if (SendCall) {
        SendCall = false
        typeof SendCallback == 'function' && SendCallback(15, errData)
      }
      return
    }
    let outWechat = PacketData.slice(16)
    PacketData = ''
    PacketDataLength = 0
    let protoLength = parseInt(outWechat.slice(6, 8), 16)
    if (outWechat.length < protoLength * 2 + 8) {
      clearTimeout(SendTimer)
      if (SendCall) {
        SendCall = false
        typeof SendCallback == 'function' && SendCallback(16, outWechat)
      }
      return
    }
    let outProto = outWechat.slice(8, 8 + protoLength * 2)
    if (PacketArray.length == 0) {
      let ctl = parseInt(outProto.slice(4, 6), 16)
      PacketArrayLength = ctl - 0x80 + 1
      if (PacketArrayLength <= 0) {
        clearTimeout(SendTimer)
        if (SendCall) {
          SendCall = false
          typeof SendCallback == 'function' && SendCallback(17, outProto)
        }
        return
      }
    }
    PacketArray.push(outProto)
    if (PacketArray.length == PacketArrayLength) {
      for (let i = 0; i < PacketArray.length; i++) {
        let bcc = 0
        let iData = PacketArray[i]
        for (let j = 2; j < iData.length - 2; j += 2) {
          let bit = parseInt(iData.slice(j, j + 2), 16)
          bcc ^= bit
        }
        if (bcc != parseInt(iData.slice(-2), 16)) {
          PacketArray = new Array()
          PacketArrayLength = 0
          clearTimeout(SendTimer)
          if (SendCall) {
            SendCall = false
            typeof SendCallback == 'function' && SendCallback(18, iData)
          }
          return
        }
      }
      let completeData = ''
      for (let i = 0; i < PacketArray.length; i++) {
        if (PacketArray[i].length > 10) {
          completeData += PacketArray[i].slice(8, -2)
        }
      }
      console.log('data：' + completeData)
      PacketArray = new Array()
      PacketArrayLength = 0
      clearTimeout(SendTimer)
      clearTimeout(ConnectTimer)
      if (SendCall) {
        SendCall = false
        typeof SendCallback == 'function' && SendCallback(0, completeData)
      }
    }
  } else {
    PacketData = ''
    PacketDataLength = 0
  }
}

/**
 * 发送数据
 */
var sendAndReceive = function (datas, callback, timeout) {
  PacketData = ''
  PacketDataLength = 0
  PacketArray = new Array()
  PacketArrayLength = 0
  SendIndex = 0
  SendDatas = datas
  SendCall = true
  SendCallback = callback
  let SendTimeout = 15 * 1000
  if (typeof timeout == 'number' && timeout > 0) {
    SendTimeout = timeout
  }
  SendTimeout = 10 * 1000
  SendTimer = setTimeout(() => {
    if (SendCall) {
      SendCall = false
      typeof SendCallback == 'function' && SendCallback(100, null)
    }
  }, SendTimeout)
  doSendData()
}

/**
 * 发送数据队列
 */
var doSendData = function () {
  my.writeBLECharacteristicValue({
    deviceId: DeviceId, // 蓝牙设备 id，参考 device 对象
    serviceId: ServiceId, // 蓝牙特征值对应 service 的 uuid
    characteristicId: WriteId, // 蓝牙特征值的 uuid
    value: SendDatas[SendIndex], // 蓝牙设备特征值对应的值，16进制字符串，限制在20字节内
    success: (res) => {
      console.log('发送：' + SendDatas[SendIndex])
      setTimeout(() => {
        SendIndex++
        if (SendIndex < SendDatas.length) {
          doSendData()
        }
      }, 5)
    },
    fail: (res) => {
      clearTimeout(SendTimer)
      if (SendCall) {
        SendCall = false
        typeof SendCallback == 'function' && SendCallback(19, res)
      }
    }
  })
}

/**
 * 初始化设备
 */
var initDevice = function () {
  InitDeviceCount--
  sendAndReceive(
    DataUtil.makeA2SendData(),
    (code, data) => {
      console.log(code, data, deviceName)
      if (code == 0 && data.toUpperCase().startsWith('B200')) {
        clearTimeout(ConnectTimer)
        if (ConnectCall) {
          ConnectCall = false
          typeof ConnectCallback == 'function' && ConnectCallback(0, null)
        }
      } else if (code == 100) {
        if (InitDeviceCount > 0) {
          initDevice()
        } else {
          clearTimeout(ConnectTimer)
          my.disconnectBLEDevice({
            deviceId: DeviceId, // 蓝牙设备id
            success: (res) => {
              console.log('初始化设备超时，断开连接设备')
            }
          })
          if (ConnectCall) {
            ConnectCall = false
            typeof ConnectCallback == 'function' && ConnectCallback(100, null)
          }
        }
      } else {
        clearTimeout(ConnectTimer)
        my.disconnectBLEDevice({
          deviceId: DeviceId, // 蓝牙设备id
          success: (res) => {
            console.log('初始化设备失败，断开连接设备')
          }
        })
        if (ConnectCall) {
          ConnectCall = false
          typeof ConnectCallback == 'function' && ConnectCallback(20, data)
        }
      }
    },
    10000
  )
}

/**
 * 获取错误码信息
 */
var GetCodeMsg = function (code) {
  return StateCode[code]
}

export default {
  ScanBleDevice: ScanBleDevice,
  ConnectBleDevice: ConnectBleDevice,
  sendAndReceive: sendAndReceive,
  GetCodeMsg: GetCodeMsg,
  closeBLEConnection: closeBLEConnection,
  closeObu: closeObu
}
