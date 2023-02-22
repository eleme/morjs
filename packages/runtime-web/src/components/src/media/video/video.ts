import { html, internalProperty, property } from 'lit-element'
import get from 'lodash.get'
import { BaseElement } from '../../baseElement'
import addScript from '../../utils/add-script'
import boolConverter from '../../utils/bool-converter'
import { ICON_TYPE } from './constant'
import { PlyrStyles } from './plyr'
import { VideoStyles } from './style'
import {
  addEvent,
  initEmptyApi,
  randomId,
  setControls,
  setVideoApi
} from './utils'

declare global {
  class Plyr {
    media: any
    elements: any
    source: { type: string; sources: { src: any }[]; poster: string }
    muted: boolean
    constructor(target: any, options: Record<string, any>)
  }
}

const cbs = []

function videoReady(callback) {
  if (typeof window.Plyr !== 'undefined') {
    callback()
  } else {
    cbs.push(callback)
  }
}

export default class VideoView extends BaseElement {
  videoId = ''
  svgContainerClass = ''
  videoTarget = null
  svgContainerTarget = null

  constructor() {
    super()
    if (typeof window.Plyr === 'undefined') {
      const defaultCndUrl = 'https://cdn.plyr.io/3.7.3/plyr.js'
      const cndUrl = get(
        window.$MOR_APP_CONFIG,
        'components.video.cdnUrl',
        defaultCndUrl
      )

      addScript({
        src: cndUrl,
        success: () => {
          for (let i = 0, l = cbs.length; i < l; i++) {
            cbs[i].call(this)
          }
        }
      })
    }

    const id = randomId()
    this.videoId = `tiga-video-${id}`
    this.svgContainerClass = `tiga-video-svg-${id}`
  }

  static get styles() {
    return [VideoStyles, PlyrStyles]
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal)
  }

  renderVideo() {
    initEmptyApi(this)
    videoReady(() => {
      // if (this.id && window[`__VIDEO_CONTENT_${this.id.toUpperCase()}`]) {
      //   return;
      // }
      const video = new Plyr(this.videoTarget, {
        loop: { active: this.loop },
        controls: this.controlsOption,
        fullscreen: {
          fallback: true,
          iosNative: true
        },
        autoplay: this.autoPlay
      })
      if (video?.media) {
        video.source = {
          type: 'video',
          sources: [
            {
              src: this.src
            }
          ],
          poster: this.poster
        }
        video.muted = true
        video.media.currentTime = this['initial-time']
        video.media.id = this.id
        addEvent(this, video)
        video.media.classList +=
          this['object-fit'] === 'fill'
            ? ' video-object-fit-fill'
            : ' video-object-fit-contain'
        video.elements.poster.className +=
          this['poster-size'] === 'cover'
            ? ' video-poster-background-size-cover'
            : ' video-poster-background-size-contain'
        setVideoApi(this, video)
      }
    })
  }

  renderSvgIcon(types) {
    videoReady(() => {
      types.forEach((type) => {
        if (type && type.id) {
          const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
          )
          svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
          svg.setAttribute('viewBox', '0 0 18 18')
          svg.setAttribute('id', type.id)
          this.svgContainerTarget && this.svgContainerTarget.appendChild(svg)

          const wrap = svg

          // if (type.type) {
          //   // todo
          // } else {
          if (type.item?.polygon) {
            ;(type?.item?.polygon || []).forEach((item) => {
              const r = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'polygon'
              )
              r.setAttribute('points', item)
              wrap.appendChild(r)
            })
          }
          if (type.item?.path) {
            ;(type?.item?.path || []).forEach((item) => {
              const r = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'path'
              )
              r.setAttribute('d', item)
              wrap.appendChild(r)
            })
          }
          // }
        }
      })
    })
  }

  initControls() {
    this.controlsOption = setControls(this.controls, {
      ['show-play-btn']: this['show-play-btn'],
      ['show-center-play-btn']: this['show-center-play-btn'],
      ['show-fullscreen-btn']: this['show-fullscreen-btn']
    })
  }

  connectedCallback() {
    super.connectedCallback()

    requestAnimationFrame(() => {
      this.videoTarget = this.shadowRoot.querySelector('#' + this.videoId)
      this.svgContainerTarget = this.shadowRoot.querySelector(
        '.' + this.svgContainerClass
      )

      this.initControls()
      this.renderVideo()
      this.renderSvgIcon(ICON_TYPE)
    })
  }

  disconnectedCallback() {
    super.disconnectedCallback()
  }

  @property({ type: String })
  id = ''

  @property({ type: String })
  src

  @property({ converter: boolConverter })
  controls = true

  @property({ converter: boolConverter })
  loop = false

  @property({ converter: boolConverter })
  muted = false;

  @property({ converter: boolConverter })
  ['show-fullscreen-btn'] = true;

  @property({ converter: boolConverter })
  ['show-play-btn'] = true;

  @property({ converter: boolConverter })
  ['show-center-play-btn'] = true

  @property({ converter: boolConverter })
  autoPlay = false;

  @property({ type: Number })
  ['initial-time'] = 0;

  @property({ type: String })
  ['object-fit'] = 'contain'

  @property({ type: String })
  poster = '';

  @property({ type: String })
  ['poster-size'] = ''

  @internalProperty()
  controlsOption = []

  render() {
    return html`
      <video id="${this.videoId}" class="tiga-video-container"></video>
      <div
        class="${this.svgContainerClass}"
        style="width:0;height:0;overflow:hidden"
      ></div>
    `
  }
}
