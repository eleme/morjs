import { getPropertiesByAttributes } from '../../utils/index'

interface KEY {
  INDICATOR_DOTS
  INDICATOR_COLOR
  INDICATOR_ACTIVE_COLOR
  AUTOPLAY
  CURRENT
  DURATION
  INTERVAL
  CIRCULAR
  VERTICAL
  PREVIOUS_MARGIN
  NEXT_MARGIN
  CLASS
  DISABLE_TOUCH
  TOUCH_ANGLE
  SWIPE_RATIO
}

type Attributes = {
  [P in keyof KEY]?: string
}

type Properties = {
  [P in keyof KEY]?: symbol
}

export const attributes: Attributes = {
  INDICATOR_DOTS: 'indicator-dots',
  INDICATOR_COLOR: 'indicator-color',
  INDICATOR_ACTIVE_COLOR: 'indicator-active-color',
  AUTOPLAY: 'autoplay',
  CURRENT: 'current',
  DURATION: 'duration',
  INTERVAL: 'interval',
  CIRCULAR: 'circular',
  VERTICAL: 'vertical',
  PREVIOUS_MARGIN: 'previous-margin',
  NEXT_MARGIN: 'next-margin',
  CLASS: 'class',
  DISABLE_TOUCH: 'disable-touch',
  TOUCH_ANGLE: 'touch-angle',
  SWIPE_RATIO: 'swipe-ratio'
}

export const properties: Properties = getPropertiesByAttributes(
  Object.keys(attributes)
)
