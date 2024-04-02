import { AudioParams, defaults, EVENTS, removeValue } from './helper'

export { AudioParams } from './helper'

export class InnerAudio {
  private params: AudioParams
  private audio: HTMLAudioElement
  private stopHoldOn = false // 使用 pause 模拟 stop
  private callbacksMap = {
    [EVENTS.PLAY]: [],
    [EVENTS.PAUSE]: [],
    [EVENTS.STOP]: [],
    [EVENTS.ENDED]: [],
    [EVENTS.TIMEUPDATE]: [],
    [EVENTS.ERROR]: [],
    [EVENTS.SEEKED]: [],
    [EVENTS.SEEKING]: []
  }

  constructor(params: AudioParams) {
    try {
      this.params = defaults(params)
      this.audio = new Audio(this.params.src)

      const keys = Object.keys(this.params)
      keys.forEach((key) => (this.audio[key] = this.params[key]))

      this._mount() // 绑定各种事件
    } catch (e) {
      this._executeCallbacks(this.callbacksMap[EVENTS.ERROR])
    }
  }

  get duration() {
    return this.audio.duration
  }

  get paused() {
    return this.audio.paused
  }

  get currentTime() {
    return this.audio.currentTime
  }

  set volume(volume: number) {
    this.audio.volume = volume
  }

  get volume() {
    return this.audio.volume
  }

  set autoplay(autoplay: boolean) {
    this.audio.autoplay = autoplay
  }

  get autoplay() {
    return this.audio.autoplay
  }

  set loop(loop: boolean) {
    this.audio.loop = true
  }

  get loop() {
    return this.audio.loop
  }

  set playbackRate(rate: number) {
    this.audio.playbackRate = rate
  }

  get playbackRate() {
    return this.audio.playbackRate
  }

  private _executeCallbacks(callbacks, params?) {
    if (Array.isArray(callbacks) && callbacks.length > 0) {
      callbacks.forEach((callback) => callback(params))
    }
  }

  private _mount() {
    const listenEvents = [
      EVENTS.PLAY,
      EVENTS.PAUSE,
      EVENTS.ENDED,
      EVENTS.SEEKED,
      EVENTS.SEEKING,
      EVENTS.TIMEUPDATE,
      EVENTS.ERROR
    ]
    const stopHoldOnEvents = [EVENTS.PAUSE, EVENTS.SEEKED, EVENTS.SEEKING] // 为了模拟 stop 事件，屏蔽这几个事件的触发，防止用户业务误处理

    listenEvents.forEach((event) =>
      this.audio.addEventListener(event, (e) => {
        if (this.stopHoldOn && stopHoldOnEvents.includes(event)) return
        // 经过测试，音频还没播放就开始触发一次 timeupdate，做兼容处理，当前状态为未播放时，不触发 timeupdate
        if (event === EVENTS.TIMEUPDATE && this.paused) return
        // timeupdate 传参区分与其他事件
        this._executeCallbacks(
          this.callbacksMap[event],
          event === EVENTS.TIMEUPDATE ? { currentTime: this.currentTime } : e
        )
      })
    )
  }

  play() {
    this.audio.play()
  }

  pause() {
    this.audio.pause()
  }

  stop() {
    this.stopHoldOn = true // 此时标记执行 stop，后续触发 seeked，seeking，pause 事件都不触发
    this.pause()
    this.seek(0)

    setTimeout(() => {
      this._executeCallbacks(this.callbacksMap[EVENTS.STOP]) // 手动触发 stop 事件
      this.stopHoldOn = false // 在下一帧中重置，因为事件是异步触发的
    }, 0)
  }

  seek(position: number) {
    this.audio.currentTime = position
  }

  destroy() {
    this.audio = null
  }

  onPlay(callback) {
    this.callbacksMap[EVENTS.PLAY].push(callback)
  }
  offPlay(callback) {
    removeValue(this.callbacksMap[EVENTS.PLAY], callback)
  }

  onPause(callback) {
    this.callbacksMap[EVENTS.PAUSE].push(callback)
  }
  offPause(callback) {
    removeValue(this.callbacksMap[EVENTS.PAUSE], callback)
  }

  onTimeUpdate(callback) {
    this.callbacksMap[EVENTS.TIMEUPDATE].push(callback)
  }
  offTimeUpdate(callback) {
    removeValue(this.callbacksMap[EVENTS.TIMEUPDATE], callback)
  }

  onStop(callback) {
    this.callbacksMap[EVENTS.STOP].push(callback)
  }
  offStop(callback) {
    removeValue(this.callbacksMap[EVENTS.STOP], callback)
  }

  onEnded(callback) {
    this.callbacksMap[EVENTS.ENDED].push(callback)
  }
  offEnded(callback) {
    removeValue(this.callbacksMap[EVENTS.ENDED], callback)
  }

  onSeeked(callback) {
    this.callbacksMap[EVENTS.SEEKED].push(callback)
  }
  offSeeked(callback) {
    removeValue(this.callbacksMap[EVENTS.SEEKED], callback)
  }

  onSeeking(callback) {
    this.callbacksMap[EVENTS.SEEKING].push(callback)
  }
  offSeeking(callback) {
    removeValue(this.callbacksMap[EVENTS.SEEKING], callback)
  }

  onError(callback) {
    this.callbacksMap[EVENTS.ERROR].push(callback)
  }
  offError(callback) {
    removeValue(this.callbacksMap[EVENTS.ERROR], callback)
  }
}
