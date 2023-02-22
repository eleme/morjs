import { CONTROLS_MAP, TOTAL_CONTROL } from './constant'

export function formatAttributes(curString, name, val, map) {
  const mapName = map[name]
  const boolVal = val === 'true' || val === true

  if (!mapName) return curString

  if (!boolVal && !curString.includes(mapName)) {
    curString += ` ${mapName}`
  } else if (boolVal && curString.includes(mapName)) {
    const curClassArray = curString.split(' ')
    const index = curString.indexOf(mapName)
    if (index !== -1) {
      curClassArray.splice(index, 1)
      curString = curClassArray.join(' ')
    }
  }

  return curString
}

/**
 * 设置controls工具栏的展示内容
 * @param {boolean} controls 是否展示controls
 * @param {object} otherProps 可自定义项的属性值
 * @returns
 */
export function setControls(controls, otherProps) {
  if (controls) {
    const supportControls = TOTAL_CONTROL
    Object.keys(otherProps).forEach((prop) => {
      if (!otherProps[prop]) {
        const index = supportControls.indexOf(CONTROLS_MAP[prop])
        supportControls.splice(index, 1)
      }
    })
    return supportControls
  } else {
    const supportControls = []
    Object.keys(otherProps).forEach((prop) => {
      otherProps[prop] &&
        CONTROLS_MAP[prop] &&
        supportControls.push(CONTROLS_MAP[prop])
    })
    return supportControls
  }
}

/**
 *
 * @param context 上下文
 * @param video 视频示例
 */
export function addEvent(context, video) {
  // 开始播放
  video.on('play', (e) => {
    const event = { ...e }
    event.detail && delete event.detail
    context.dispatchEvent(new CustomEvent('play', event))
  })

  // 暂停
  video.on('pause', (e) => {
    const event = { ...e }
    event.detail && delete event.detail
    context.dispatchEvent(new CustomEvent('pause', event))
  })

  // 结束播放
  video.on('ended', (e) => {
    const event = { ...e }
    event.detail && delete event.detail
    context.dispatchEvent(new CustomEvent('ended', event))
  })

  // 时间进度更新
  video.on('timeupdate', (e) => {
    const event = { ...e }
    event.detail = {
      currentTime: video.currentTime
    }
    context.dispatchEvent(new CustomEvent('timeupdate', event))
  })

  // 报错
  video.on('error', (e) => {
    const event = { ...e }
    console.log('Video Error:', e)
    context.dispatchEvent(new CustomEvent('playerror', event))
  })
}

export function initEmptyApi(self) {
  if (self.id) {
    const noop = (e) => e
    // 设置对象api
    window[`__VIDEO_CONTENT_${self.id.toUpperCase()}`] = {
      id: self.id,
      nodeName: 'video',
      play: noop, // 播放
      pause: noop, // 暂停
      stop: noop, // 停止
      seek: noop,
      mute: noop,
      requestFullScreen: noop, // 进入全屏
      exitFullScreen: noop, // 推出全屏
      playbackRate: noop
    }
  }
}

export function setVideoApi(self, video) {
  if (self.id) {
    // 设置对象api
    Object.assign(window[`__VIDEO_CONTENT_${self.id.toUpperCase()}`], {
      id: self.id,
      play: video.play, // 播放
      pause: video.pause, // 暂停
      stop: video.stop, // 停止
      seek: (seekTime = 10) => {
        // 跳至某时间
        video.restart()
        video.forward(seekTime)
      },
      mute: () => {
        // 静音
        video.muted = true
      },
      requestFullScreen: video.fullscreen.enter, // 进入全屏
      exitFullScreen: video.fullscreen.exit, // 推出全屏
      playbackRate: (speed) => {
        // 倍速
        video.speed = speed
      }
    })
  }
}

export const randomId = () => Math.round(Math.random() * 1000000)
