import { logger } from 'takin'
import { CLI_NAME } from './constants'

// 通用 logger
logger.init('info', {
  debugPrefix: CLI_NAME,
  prefix: `[${CLI_NAME}]`
})

export { logger }
