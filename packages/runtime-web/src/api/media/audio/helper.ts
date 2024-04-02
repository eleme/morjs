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
