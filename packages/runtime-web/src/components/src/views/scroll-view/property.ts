import { getPropertiesByAttributes } from '../../utils/index'

interface KEY {
  DISABLE_SCROLL: any
  SCROLL_TOP: any
  SCROLL_LEFT: any
  SCROLL_INTO_VIEW: any
  UPPER_THRESHOLD: any
  LOWER_THRESHOLD: any
  SCROLL_X: any
  SCROLL_Y: any
  TRAP_SCROLL: any
  SCROLL_WITH_ANIMATION: any
}

type Attributes = {
  [P in keyof KEY]?: string
}

type Properties = {
  [P in keyof KEY]?: symbol
}

export const attributes: Attributes = {
  DISABLE_SCROLL: 'disable-scroll',
  SCROLL_TOP: 'scroll-top',
  SCROLL_LEFT: 'scroll-left',
  SCROLL_INTO_VIEW: 'scroll-into-view',
  UPPER_THRESHOLD: 'upper-threshold',
  LOWER_THRESHOLD: 'lower-threshold',
  SCROLL_X: 'scroll-x',
  SCROLL_Y: 'scroll-y',
  TRAP_SCROLL: 'trap-scroll',
  SCROLL_WITH_ANIMATION: 'scroll-with-animation'
}

export const properties: Properties = getPropertiesByAttributes(
  Object.keys(attributes)
)
