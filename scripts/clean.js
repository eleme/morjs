const { clean } = require('./util')

async function clear() {
  await clean('lerna-debug.log')
  await clean('packages/**/yarn-error.log')
  await clean('packages/*/lib')
  await clean('packages/*/esm')
  await clean('packages/*/miniprogram_dist')
}

clear()
