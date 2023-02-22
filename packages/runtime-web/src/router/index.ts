export { createRouter } from './router'
export { getCustomUrl } from './url'
import { getPageId, getRoute } from './url'

window.$getRoute = getRoute
window.$getPageId = getPageId
