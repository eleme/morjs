import BleUtil from './BleUtil'
import DataUtil from './DataUtil'
Page({
  data: {},
  onLoad() {
    console.log('欢迎测试')
  },

  action1: function () {
    BleUtil.ScanBleDevice((code, device) => {
      console.log('设备信息', JSON.stringify(device))
      if (code == 0) {
        BleUtil.ConnectBleDevice(
          device.deviceId,
          (code, data) => {
            if (code == 0) {
              console.log('连接成功')
            } else {
              console.log('连接失败')
            }
          },
          15 * 1000
        )
      } else {
        console.log(code, BleUtil.GetCodeMsg(code))
        console.log('搜索失败')
      }
    }, 15 * 1000)
  },
  // 读卡号
  action2: function () {
    let tlv = DataUtil.makeTLV(['00A40000021001', '00B0950A0A'], [false, true])
    BleUtil.sendAndReceive(
      DataUtil.makeA3SendData('00', tlv),
      (code, data) => {
        if (code == 0) {
          let apdus = DataUtil.reTLV(data.slice(10))
          if (data.endsWith('9000')) {
            console.log('卡号:' + apdus[0].slice(0, -4))
          } else {
            console.log('指令执行失败:' + data.slice(-4))
          }
        } else {
          console.log(BleUtil.GetCodeMsg(0))
          console.log(data)
        }
      },
      5000
    )
  },
  // 读余额
  action3: function () {
    let tlv = DataUtil.makeTLV(['00A40000021001', '805c000204'], [false, true])
    BleUtil.sendAndReceive(
      DataUtil.makeA3SendData('00', tlv),
      (code, data) => {
        if (code == 0) {
          let apdus = DataUtil.reTLV(data.slice(10))
          if (data.endsWith('9000')) {
            console.log('余额:' + parseInt(apdus[0].slice(0, -4), 16))
          } else {
            console.log('指令执行失败:' + data.slice(-4))
          }
        } else {
          console.log(BleUtil.GetCodeMsg(0))
          console.log(data)
        }
      },
      5000
    )
  },
  // 取卡片 1001 随机数
  action4: function () {
    let tlv = DataUtil.makeTLV(['00A40000021001', '0084000004'], [false, true])
    BleUtil.sendAndReceive(
      DataUtil.makeA3SendData('00', tlv),
      (code, data) => {
        if (code == 0) {
          let apdus = DataUtil.reTLV(data.slice(10))
          if (data.endsWith('9000')) {
            console.log('随机数:' + apdus[0].slice(0, -4))
          } else {
            console.log('指令执行失败:' + data.slice(-4))
          }
        } else {
          console.log(BleUtil.GetCodeMsg(0))
          console.log(data)
        }
      },
      5000
    )
  },
  // 0015文件
  action5: function () {
    // ['00A40000021001', '00B095002B']
    let tlv = DataUtil.makeTLV(['00A40000021001', '00B095002B'], [false, true])
    BleUtil.sendAndReceive(
      DataUtil.makeA3SendData('00', tlv),
      (code, data) => {
        if (code == 0) {
          let apdus = DataUtil.reTLV(data.slice(10))
          if (data.endsWith('9000')) {
            console.log('0015文件:' + apdus[0].slice(0, -4))
            let cardMsg1 = apdus[0].slice(0, -4)

            console.log('单片式:' + parseInt(cardMsg1.slice(18, 20), 16))
            console.log({
              faceCardNum: cardMsg1.slice(24, 40),
              cardNo: cardMsg1.slice(20, 40),
              cardType: cardMsg1.slice(16, 18),
              version: cardMsg1.slice(18, 20)
            })
          } else {
            console.log('指令执行失败:' + data.slice(-4))
          }
        } else {
          console.log(BleUtil.GetCodeMsg(0))
          console.log(data)
        }
      },
      5000
    )
  },
  // esam 通道
  action6: function () {
    let tlv = DataUtil.makeTLV(['00A40000023F00'], [true])
    BleUtil.sendAndReceive(
      DataUtil.makeA8SendData('00', tlv),
      (code, data) => {
        if (code == 0) {
          let apdus = DataUtil.reTLV(data.slice(10))
          if (data.endsWith('9000')) {
            console.log('合同号:' + apdus[0].slice(0, -4))
          } else {
            console.log('指令执行失败:' + data.slice(-4))
          }
        } else {
          console.log(BleUtil.GetCodeMsg(0))
          console.log(data)
        }
      },
      5000
    )
  },
  // OBU状态
  action7: function () {
    // ['00A40000023F00', '00A4000002EF01', '00B081001B']
    let tlv = DataUtil.makeTLV(['00A40000023F00', '00B0810063'], [true, true])
    BleUtil.sendAndReceive(
      DataUtil.makeA8SendData('00', tlv),
      (code, data) => {
        console.log('OBU状态 data: ', data)
        if (code == 0) {
          let apdus = DataUtil.reTLV(data.slice(10))
          console.log('返回数组', JSON.stringify(apdus))
          let initiateState = apdus[1].substring(52, 52 + 2)

          // initiateState === '01' OBU已激活
          // initiateState === '00' OBU已失效
          // 02 可用
          console.log('OBU 状态 initiateState:' + initiateState)

          if (data.endsWith('9000')) {
            console.log('获取OBU信息:' + apdus[0].slice(0, -4))
          } else {
            console.log('指令执行失败:' + data.slice(-4))
          }
        } else {
          console.log(BleUtil.GetCodeMsg(0))
          console.log(data)
        }
      },
      5000
    )
  },
  // 防拆指令
  action5x: function () {
    // ['00A40000023F00', '00A4000002EF01', '00B081001B']
    let tlv = DataUtil.makeTLV(['00A40000023F00', '0059000001'], [true, true])
    BleUtil.sendAndReceive(
      DataUtil.makeA8SendData('00', tlv),
      (code, data) => {
        console.log('防拆指令 data: ', data)
        if (code == 0) {
          let apdus = DataUtil.reTLV(data.slice(10))
          console.log('返回数组', JSON.stringify(apdus))

          if (data.endsWith('9000')) {
            console.log('获取OBU信息:' + apdus[0].slice(0, -4))
          } else {
            console.log('指令执行失败:' + data.slice(-4))
          }
        } else {
          console.log(BleUtil.GetCodeMsg(0))
          console.log(data)
        }
      },
      5000
    )
  },
  // 00B081001B vs 00B000001B
  // 获取OBU信息
  action8: function () {
    // '00A40000023F00','00B081001B'
    let tlv = DataUtil.makeTLV(
      ['00A40000023F00', '00A4000002EF01', '00B000001B'],
      [false, false, true]
    )
    BleUtil.sendAndReceive(
      DataUtil.makeA8SendData('00', tlv),
      (code, data) => {
        console.log('获取obu信息 data: ', data)
        if (code == 0) {
          let apdus = DataUtil.reTLV(data.slice(10))
          console.log('返回数组', JSON.stringify(apdus))
          if (data.endsWith('9000')) {
            console.log('获取OBU信息:' + apdus[0].slice(0, -4))
          } else {
            console.log('指令执行失败:' + data.slice(-4))
          }
        } else {
          console.log(BleUtil.GetCodeMsg(0))
          console.log(data)
        }
      },
      5000
    )
  },
  // 读合同序列号 合同序列号
  // 00b0810a08
  action9: function () {
    // ['00A40000023F00', '00B081001B']
    let tlv = DataUtil.makeTLV(['00A40000023F00', '00B0810A08'], [false, true])
    BleUtil.sendAndReceive(
      DataUtil.makeA8SendData('00', tlv),
      (code, data) => {
        console.log('读合同序列号 data: ', data)
        if (code == 0) {
          let apdus = DataUtil.reTLV(data.slice(10))
          console.log('返回数组', JSON.stringify(apdus))
          if (data.endsWith('9000')) {
            console.log('合同号:' + apdus[0].slice(0, -4))
          } else {
            console.log('指令执行失败:' + data.slice(-4))
          }
        } else {
          console.log(BleUtil.GetCodeMsg(0))
          console.log(data)
        }
      },
      5000
    )
  },
  // 取ESAM DF01 随机数
  action10: function () {
    // '00A4000002DF01', '00A4000002EF01', '0084000004'
    let tlv = DataUtil.makeTLV(
      ['00A4000002DF01', '00A4000002EF01', '0084000004'],
      [false, false, true]
    )
    BleUtil.sendAndReceive(
      DataUtil.makeA8SendData('00', tlv),
      (code, data) => {
        if (code == 0) {
          let apdus = DataUtil.reTLV(data.slice(10))
          console.log('返回数组', JSON.stringify(apdus))
          if (data.endsWith('9000')) {
            console.log('随机数:' + apdus[0].slice(0, -4))
          } else {
            console.log('指令执行失败:' + data.slice(-4))
          }
        } else {
          console.log(BleUtil.GetCodeMsg(0))
          console.log(data)
        }
      },
      5000
    )
  },
  action11: function () {
    let tlv = DataUtil.makeTLV(['00B0810901'], [true])
    BleUtil.sendAndReceive(
      DataUtil.makeA8SendData('00', tlv),
      (code, data) => {
        if (code == 0) {
          let apdus = DataUtil.reTLV(data.slice(10))
          console.log('返回数组', JSON.stringify(apdus))
          if (data.endsWith('9000')) {
            console.log('返回值:' + apdus[0].slice(0, -4))
          } else {
            console.log('指令执行失败:' + data.slice(-4))
          }
        } else {
          console.log(BleUtil.GetCodeMsg(0))
          console.log(data)
        }
      },
      5000
    )
  },
  // 取设备序列号
  action12: function () {
    BleUtil.sendAndReceive(
      DataUtil.makeA5SendData('C0'),
      (code, data) => {
        if (code == 0) {
          if (data.toUpperCase().startsWith('B500')) {
            let message = data.slice(8)
            let deviceNo = ''
            for (let i = 1; i < message.length; i += 2) {
              deviceNo = deviceNo + message.slice(i, i + 1)
            }
            console.log('设备序列号：' + deviceNo)
          } else {
            console.log('指令执行失败:' + data.slice(-4))
          }
        } else {
          console.log(BleUtil.GetCodeMsg(0))
          console.log(data)
        }
      },
      5000
    )
  },

  action13: function () {
    BleUtil.sendAndReceive(
      DataUtil.makeA5SendData('C3'),
      (code, data) => {
        if (code == 0 || code == 100) {
          console.log('关闭成功')
        } else {
          console.log('关闭失败')
        }
      },
      3000
    )
  }
})
