import { hasOwnProperty } from '../../utils/index'

const isArray = Array.isArray

module.exports = {
  copyOptions: function (options) {
    let key
    const copy = {}

    for (key in options) {
      if (hasOwnProperty(options, key)) {
        copy[key] = options[key]
      }
    }
    return copy
  },

  ensureFlagExists: function (item, options) {
    if (!(item in options) || typeof options[item] !== 'boolean') {
      options[item] = false
    }
  },

  ensureSpacesExists: function (options) {
    if (
      !('spaces' in options) ||
      (typeof options.spaces !== 'number' && typeof options.spaces !== 'string')
    ) {
      options.spaces = 0
    }
  },

  ensureAlwaysArrayExists: function (options) {
    if (
      !('alwaysArray' in options) ||
      (typeof options.alwaysArray !== 'boolean' &&
        !isArray(options.alwaysArray))
    ) {
      options.alwaysArray = false
    }
  },

  ensureKeyExists: function (key, options) {
    if (!(key + 'Key' in options) || typeof options[key + 'Key'] !== 'string') {
      options[key + 'Key'] = options.compact ? '_' + key : key
    }
  },

  checkFnExists: function (key, options) {
    return key + 'Fn' in options
  }
}
