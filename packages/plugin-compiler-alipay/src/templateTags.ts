/**
 * 小程序包装组件
 */
const containerTag = ['block']

/**
 * 小程序的视图组件
 */
const viewTag = [
  'view',
  'swiper',
  'scroll-view',
  'cover-view',
  'cover-image',
  'movable-view',
  'movable-area'
]

/**
 * 小程序的内容组件
 */
const contentTag = ['text', 'icon', 'progress', 'rich-text']

/**
 * 小程序的表单组件
 */
const formTag = [
  'button',
  'form',
  'label',
  'input',
  'textarea',
  'radio',
  'radio-group',
  'checkbox',
  'checkbox-group',
  'switch',
  'slider',
  'picker-view-column',
  'picker-view',
  'picker'
]

/**
 * 小程序的导航组件
 */
const navigatorTag = ['navigator']

/**
 * 小程序的媒体组件
 */
const mediaTag = [
  'audio',
  'live-player',
  'live-pusher',
  'ai-camera',
  'ar',
  'rtc-room',
  'image',
  'video',
  'camera',
  'lottie'
]

/**
 * 小程序的画布组件
 */
const canvasTag = ['canvas']

/**
 * 小程序的地图组件
 */
const mapTag = ['map']

/**
 * 小程序的营销组件
 */
const marketingTag = ['cdp', 'ucdp', 'ad']

/**
 * 小程序的开放组件
 */
const openTag = [
  'web-view',
  'lifestyle',
  'contact-button',
  'add-to-favorite',
  'zm-evaluation',
  'zm-credit-assessment',
  'error-view',
  'spread'
]

/**
 * 小程序的无障碍组件
 */
const ariaTag = ['aria-component']

/**
 * 配置属性组件
 */
const configTag = ['page-meta']

/**
 * 模版组件
 */
const templateTag = ['template']

/**
 * 所有小程序原生组件
 */
const allTag = [
  ...containerTag,
  ...viewTag,
  ...contentTag,
  ...formTag,
  ...navigatorTag,
  ...mediaTag,
  ...canvasTag,
  ...mapTag,
  ...marketingTag,
  ...openTag,
  ...ariaTag,
  ...configTag,
  ...templateTag
]

/**
 * 是否是小程序表单组件
 *
 * @export
 * @param {string} tag 组件名
 * @returns {boolean} 是否是小程序表单组件
 */
export function isFormTag(tag: string): boolean {
  return formTag.includes(tag)
}

/**
 * 是否是小程序原生组件
 *
 * @export
 * @param {string} tag 组件名
 * @returns {boolean} 是否是小程序原生组件
 */
export function isNativeTag(tag: string): boolean {
  return allTag.includes(tag)
}
