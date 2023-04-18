/**
 * number转换成指定字节数的hexString
 * num：转换的number值
 * bitNum：转换后的字节数
 * isBig：true-大端，fasle-小端
 */
var num2hex = function (num, bitNum, isBig) {
  let hex = num.toString(16)
  for (let i = hex.length; i < bitNum * 2; i++) {
    hex = '0' + hex
  }
  //转小端
  if (isBig == false) {
    let temp = ''
    for (let i = hex.length - 2; i >= 0; i -= 2) {
      temp = temp + hex.slice(i, i + 2)
    }
    hex = temp
  }
  return hex
}

/**
 * TLV指令构造
 * tpdus:指令集合
 * needResponse:对于tpdu指令是否需要返回数据，true有返回，fasle没有返回，如：['00a40000023f00','00a40000021001'],[true,false],这前一条有返回3f00的信息和状态码，后一条则只返回状态码，没有信息
 */
var makeTLV = function (tpdus, needResponses) {
  let tlv = ''
  for (let i = 0; i < tpdus.length; i++) {
    let temp = '' + tpdus[i]
    let status = i + 1
    if (needResponses && needResponses[i] === false) {
      status = 0x80 + status
    }
    let tempLen = parseInt(temp.length / 2)
    let tempLenHex = tempLen.toString(16)
    if (tempLenHex.length % 2 != 0) {
      tempLenHex = '0' + tempLenHex
    }
    if (tempLen > 0x80) {
      tempLenHex =
        (0x80 + parseInt(tempLenHex.length / 2)).toString(16) + tempLenHex
    }
    tlv = tlv + num2hex(status, 1, true) + tempLenHex + temp
  }
  let tlvLen = parseInt(tlv.length / 2)
  let tlvLenHex = tlvLen.toString(16)
  if (tlvLenHex.length % 2 != 0) {
    tlvLenHex = '0' + tlvLenHex
  }
  if (tlvLen > 0x80) {
    tlvLenHex = (0x80 + parseInt(tlvLenHex.length / 2)).toString(16) + tlvLenHex
  }
  return '80' + tlvLenHex + tlv
}

/**
 * 分解TLV指令结构,返回tpdu指令数组
 */
var resolveTLV = function (tlv) {
  let tpdus = new Array()
  let lenc = parseInt(tlv.substring(2, 4), 16)
  let index = 4
  if (lenc > 0x80) {
    index = index + (lenc - 0x80) * 2
  }
  let count = 1
  while (index < tlv.length) {
    let time = parseInt(tlv.substring(index, index + 2), 16)
    index += 2
    let len = parseInt(tlv.substring(index, index + 2), 16)
    if (len > 0x80) {
      let bit = (len - 0x80) * 2
      len = parseInt(tlv.substring(index, index + bit), 16)
      index += bit
    }
    index += 2
    let tpdu = tlv.substring(index, index + len * 2)
    tpdus.push(tpdu)
    index += len * 2
  }
  if (tpdus.length == 0) {
    tpdus.push('FFFF')
  }
  return tpdus
}

/**
 * 微信硬件协议握手包
 */
var makeAuthResponse = function () {
  return ['fe0100184e2100010a06080012024f4b12063132', '33313234']
}

/**
 * 微信硬件协议握手包
 */
var makeInitResponse = function () {
  return ['fe0100164e2300020a06080012024f4b10001800', '2000']
}
/**
 * app和蓝牙盒子建立握手
 */
var makeA2SendData = function () {
  let data = 'a2'
  return makeFrame(data)
}

/**
 * PICC通道
 * dataType:"00"=明文，"01"=密文
 * cos指令：TLV格式(最大长度不吵384)
 */
var makeA3SendData = function (dataType, cos) {
  let data = 'a3' + dataType
  let len = num2hex(parseInt(cos.length / 2), 2, false)
  data += len
  data += cos
  return makeFrame(data)
}
/**
 * SE指令通道
 * dataType:"00"=明文，"01"=密文
 * cos指令：TLV格式(最大长度不吵384)
 */
var makeA4SendData = function (dataType, cos) {
  let data = 'a4' + dataType
  let len = num2hex(parseInt(cos.length / 2), 2, false)
  data += len
  data += cos
  return makeFrame(data)
}

/**
 * 蓝牙盒子通道
 * "c0"=获取蓝牙盒子设备编号
 * "c1"=获取蓝牙盒子版本号
 * "c2"=获取蓝牙盒子电池电量
 * "c3"=强制蓝牙盒子断电
 * "c4"=对蓝牙盒子超时计数器清零
 * "C6"=获取obu mac
 */
var makeA5SendData = function (command) {
  let data = 'a5'
  let len = num2hex(parseInt(command.length / 2), 1, true)
  data += len
  data += command
  return makeFrame(data)
}

/**
 * 认证通道
 * "c0"=认证指令1
 * "c1"+渠道证书号+渠道证书+Rnd2=认证指令2：渠道证书号（1bytes），0x01表示渠道证书1（001C文件），0x02表示渠道证书2（001D文件），0x03表示渠道证书3（001E文件）。渠道证书为证书明文（xx bytes）。Rnd2为随机数，长度为32bytes(其中前8字节为UTC时间) 。
 * "c2"+F1信息=认证指令3：F1:20bytes
 * "c3"+渠道证书号+Rnd2=认证指令4：渠道证书号（1bytes），0x01表示渠道证书1（001C文件），0x02表示渠道证书2（001D文件），0x03表示渠道证书3（001E文件）。Rnd2为随机数，长度为32bytes(其中前8字节为UTC时间) 。
 * "c4"=新版认证指令1(国密)
 * "c5"+工作密钥密文+工作密钥校验值（8字节）+MAC密钥密文+MAC密钥校验值（8字节）+Rnd2（16字节）+S2=新版认证指令2(国密)S2: 工作密钥密文 + 工作密钥校验码 + MAC密钥密文 + MAC密钥校验码 + 随机数的签名值（服务器私钥签名）注：设备端由SE完成验签、密钥校验、密钥解密操作
 */
var makeA6SendData = function (command) {
  let data = 'a6'
  let len = num2hex(parseInt(command.length / 2), 2, false)
  data += len
  data += command
  return makeFrame(data)
}

/**
 * ESAM指令通道
 * dataType:"00"=明文，"01"=密文
 * cos指令：TLV格式(最大长度不吵384)
 */
var makeA7SendData = function (dataType, cos) {
  let data = 'a8' + dataType
  let len = num2hex(parseInt(cos.length / 2), 2, false)
  data += len
  data += cos
  return makeFrame(data)
}

/**
 * OBU ESAM复位
 */

var makeA8SendData = function (command) {
  let data = 'a8'
  let len = num2hex(parseInt(command.length / 2), 2, false)
  data += len
  data += command
  return makeFrame(data)
}

/**
 * 获取记录指令通道
 * "c0"+索引=获取PICC通道指令记录索引（1bytes）:记录索引号，循环记录，最新的记录号为01，上一次的为02，依次类推……
 */
var makeABSendData = function (command) {
  let data = 'ab'
  let len = num2hex(parseInt(command.length / 2), 2, false)
  data += len
  data += command
  return makeFrame(data)
}

const frameLength = 184
const sendLength = 40
const ST = '33'
const pre_Proto = '0a0012'
const end_Proto = '1800'
const bMagic = 'fe'
const bVer = '01'
const bCmdId = '7531'
var SEQ = 3

/**
 * 发送数据组协议包
 */
var makeFrame = function (data) {
  let frameCount = parseInt(data.length / frameLength)
  let frameBalance = data.length % frameLength
  let frames = new Array()
  for (let i = 0; i < frameCount; i++) {
    frames.push(data.slice(i * frameLength, (i + 1) * frameLength))
  }
  if (frameBalance > 0) {
    frames.push(data.slice(-frameBalance))
  }
  let manufacturerFrames = new Array()
  for (let i = 0; i < frames.length; i++) {
    let temp = frames[i]
    let SN = num2hex(i + 1, 1, true)
    let CTL = ''
    if (i == 0) {
      CTL = num2hex(0x80 + frames.length - 1, 1, true)
    } else {
      CTL = num2hex(frames.length - i - 1, 1, true)
    }
    let LEN = num2hex(parseInt(temp.length / 2), 1, true)
    let frame = ST + SN + CTL + LEN + temp
    let bcc = 0
    for (let j = 1; j < parseInt(frame.length / 2); j++) {
      let bit = parseInt(frame.slice(j * 2, (j + 1) * 2), 16)
      bcc = bcc ^ bit
    }
    frame += num2hex(bcc, 1, true)
    manufacturerFrames.push(frame)
  }
  //加proto
  let protoFrames = new Array()
  for (let i = 0; i < manufacturerFrames.length; i++) {
    let temp = manufacturerFrames[i]
    let len = num2hex(parseInt(temp.length / 2), 1, true)
    let frame = pre_Proto + len + temp + end_Proto
    protoFrames.push(frame)
  }
  //加微信头
  let wechatFrames = new Array()
  for (let i = 0; i < protoFrames.length; i++) {
    let temp = protoFrames[i]
    let nLen = num2hex(parseInt(temp.length / 2) + 8, 2, true)
    let nSeq = num2hex(SEQ, 2, true)
    let frame = bMagic + bVer + nLen + bCmdId + nSeq + temp
    wechatFrames.push(frame)
  }
  //SEQ 累计
  SEQ++
  if (SEQ > 0xf) {
    SEQ = 1
  }
  //分割发生小包
  let bufferArray = new Array()
  for (let i = 0; i < wechatFrames.length; i++) {
    let temp = wechatFrames[i]
    let bufferCount = parseInt(temp.length / sendLength)
    let bufferBalance = temp.length % sendLength
    for (let j = 0; j < bufferCount; j++) {
      let item = temp.slice(j * sendLength, (j + 1) * sendLength)
      bufferArray.push(item)
    }
    if (bufferBalance > 0) {
      let item = temp.slice(-bufferBalance)
      bufferArray.push(item)
    }
  }
  return bufferArray
}

var DataUtil = {
  num2hex: num2hex,
  makeTLV: makeTLV,
  reTLV: resolveTLV,
  makeAuthResponse: makeAuthResponse,
  makeInitResponse: makeInitResponse,
  makeA2SendData: makeA2SendData,
  makeA3SendData: makeA3SendData,
  makeA4SendData: makeA4SendData,
  makeA5SendData: makeA5SendData,
  makeA6SendData: makeA6SendData,
  makeA7SendData: makeA7SendData,
  makeA8SendData: makeA8SendData,
  makeABSendData: makeABSendData
}

export default DataUtil
