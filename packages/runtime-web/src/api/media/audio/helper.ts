// Audio 参数 https://opendocs.alipay.com/mini/08iqsg?pathHash=d97ea89d#%E6%A6%82%E8%A7%88
export interface AudioParams {
  src?: string
  startTime?: number
  playbackRate?: number
  autoplay?: boolean
  loop?: boolean
  volume?: number
}

export const defaults = (params: AudioParams) => {
  const defaultParams: AudioParams = {
    startTime: 0,
    playbackRate: 1,
    autoplay: false,
    loop: false
  }

  return Object.assign({}, defaultParams, params)
}

export const EVENTS = {
  PLAY: 'play',
  PAUSE: 'pause',
  STOP: 'stop',
  ENDED: 'ended',
  TIMEUPDATE: 'timeupdate',
  ERROR: 'error',
  SEEKED: 'seeked',
  SEEKING: 'seeking'
}

export const removeValue = (arr, value) => {
  if (Array.isArray(arr) && arr.length > 0) {
    const index = arr.indexOf(value)

    if (index > -1) arr.splice(index, 1)
  }
}
