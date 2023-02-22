'use strict'
export {}

const postcss = require('postcss')
const pxRegex = /"[^"]+"|'[^']+'|url\([^\)]+\)|(\d*\.?\d+)rpx/g

const defaults = {
  ratio: 2
}

module.exports = postcss.plugin('postcss-rpx2px', function (options) {
  const opts = {
    ...defaults,
    ...options
  }
  return function (css) {
    css.walkAtRules(function (rule) {
      if (rule.params?.indexOf('rpx') === -1) return

      rule.params = rule.params.replace(pxRegex, createPxReplace(opts))
    })

    css.walkDecls(function (decl) {
      if (decl.value.indexOf('rpx') === -1) return

      decl.value = decl.value.replace(pxRegex, createPxReplace(opts))
    })
  }
})

function createPxReplace(opts) {
  return function (m, $1) {
    const pxValue = opts.ratio ? toFixed($1 / opts.ratio) : $1
    return pxValue === 0 ? '0' : pxValue + 'px'
  }
}

function toFixed(number) {
  return Math.floor(number * 100) / 100
}
