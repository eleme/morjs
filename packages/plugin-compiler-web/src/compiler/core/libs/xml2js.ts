const sax = require('./sax')
const helper = require('./options-helper')
const isArray = Array.isArray

let options
let currentElement

function validateOptions(userOptions) {
  options = helper.copyOptions(userOptions)
  helper.ensureFlagExists('ignoreDeclaration', options)
  helper.ensureFlagExists('ignoreInstruction', options)
  helper.ensureFlagExists('ignoreAttributes', options)
  helper.ensureFlagExists('ignoreText', options)
  helper.ensureFlagExists('ignoreComment', options)
  helper.ensureFlagExists('ignoreCdata', options)
  helper.ensureFlagExists('ignoreDoctype', options)
  helper.ensureFlagExists('compact', options)
  helper.ensureFlagExists('alwaysChildren', options)
  helper.ensureFlagExists('addParent', options)
  helper.ensureFlagExists('trim', options)
  helper.ensureFlagExists('nativeType', options)
  helper.ensureFlagExists('nativeTypeAttributes', options)
  helper.ensureFlagExists('sanitize', options)
  helper.ensureFlagExists('instructionHasAttributes', options)
  helper.ensureFlagExists('captureSpacesBetweenElements', options)
  helper.ensureAlwaysArrayExists(options)
  helper.ensureKeyExists('declaration', options)
  helper.ensureKeyExists('instruction', options)
  helper.ensureKeyExists('attributes', options)
  helper.ensureKeyExists('text', options)
  helper.ensureKeyExists('comment', options)
  helper.ensureKeyExists('cdata', options)
  helper.ensureKeyExists('doctype', options)
  helper.ensureKeyExists('type', options)
  helper.ensureKeyExists('name', options)
  helper.ensureKeyExists('elements', options)
  helper.ensureKeyExists('parent', options)
  helper.checkFnExists('doctype', options)
  helper.checkFnExists('instruction', options)
  helper.checkFnExists('cdata', options)
  helper.checkFnExists('comment', options)
  helper.checkFnExists('text', options)
  helper.checkFnExists('instructionName', options)
  helper.checkFnExists('elementName', options)
  helper.checkFnExists('attributeName', options)
  helper.checkFnExists('attributeValue', options)
  helper.checkFnExists('attributes', options)
  return options
}

function nativeType(value) {
  const nValue = Number(value)
  if (!isNaN(nValue)) {
    return nValue
  }
  const bValue = value.toLowerCase()
  if (bValue === 'true') {
    return true
  } else if (bValue === 'false') {
    return false
  }
  return value
}

function addField(type, value) {
  let key
  if (options.compact) {
    if (
      !currentElement[options[type + 'Key']] &&
      (isArray(options.alwaysArray)
        ? options.alwaysArray.indexOf(options[type + 'Key']) !== -1
        : options.alwaysArray)
    ) {
      currentElement[options[type + 'Key']] = []
    }
    if (
      currentElement[options[type + 'Key']] &&
      !isArray(currentElement[options[type + 'Key']])
    ) {
      currentElement[options[type + 'Key']] = [
        currentElement[options[type + 'Key']]
      ]
    }
    if (type + 'Fn' in options && typeof value === 'string') {
      value = options[type + 'Fn'](value, currentElement)
    }
    if (
      type === 'instruction' &&
      ('instructionFn' in options || 'instructionNameFn' in options)
    ) {
      for (key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          if ('instructionFn' in options) {
            value[key] = options.instructionFn(value[key], key, currentElement)
          } else {
            const temp = value[key]
            delete value[key]
            value[options.instructionNameFn(key, temp, currentElement)] = temp
          }
        }
      }
    }
    if (isArray(currentElement[options[type + 'Key']])) {
      currentElement[options[type + 'Key']].push(value)
    } else {
      currentElement[options[type + 'Key']] = value
    }
  } else {
    if (!currentElement[options.elementsKey]) {
      currentElement[options.elementsKey] = []
    }
    const element = {}
    element[options.typeKey] = type
    if (type === 'instruction') {
      for (key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          break
        }
      }
      element[options.nameKey] =
        'instructionNameFn' in options
          ? options.instructionNameFn(key, value, currentElement)
          : key
      if (options.instructionHasAttributes) {
        element[options.attributesKey] = value[key][options.attributesKey]
        if ('instructionFn' in options) {
          element[options.attributesKey] = options.instructionFn(
            element[options.attributesKey],
            key,
            currentElement
          )
        }
      } else {
        if ('instructionFn' in options) {
          value[key] = options.instructionFn(value[key], key, currentElement)
        }
        element[options.instructionKey] = value[key]
      }
    } else {
      if (type + 'Fn' in options) {
        value = options[type + 'Fn'](value, currentElement)
      }
      element[options[type + 'Key']] = value
    }
    if (options.addParent) {
      element[options.parentKey] = currentElement
    }
    currentElement[options.elementsKey].push(element)
  }
}

function manipulateAttributes(attributes) {
  if ('attributesFn' in options && attributes) {
    attributes = options.attributesFn(attributes, currentElement)
  }
  if (
    (options.trim ||
      'attributeValueFn' in options ||
      'attributeNameFn' in options ||
      options.nativeTypeAttributes) &&
    attributes
  ) {
    let key
    for (key in attributes) {
      if (Object.prototype.hasOwnProperty.call(attributes, key)) {
        if (options.trim) attributes[key] = attributes[key].trim()
        if (options.nativeTypeAttributes) {
          attributes[key] = nativeType(attributes[key])
        }
        if ('attributeValueFn' in options)
          attributes[key] = options.attributeValueFn(
            attributes[key],
            key,
            currentElement
          )
        if ('attributeNameFn' in options) {
          const temp = attributes[key]
          delete attributes[key]
          attributes[
            options.attributeNameFn(key, attributes[key], currentElement)
          ] = temp
        }
      }
    }
  }
  return attributes
}

function onInstruction(instruction) {
  let attributes = {}
  if (
    instruction.body &&
    (instruction.name.toLowerCase() === 'xml' ||
      options.instructionHasAttributes)
  ) {
    const attrsRegExp = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\w+))\s*/g
    let match
    while ((match = attrsRegExp.exec(instruction.body)) != null) {
      attributes[match[1]] = match[2] || match[3] || match[4]
    }
    attributes = manipulateAttributes(attributes)
  }
  if (instruction.name.toLowerCase() === 'xml') {
    if (options.ignoreDeclaration) {
      return
    }
    currentElement[options.declarationKey] = {}
    if (Object.keys(attributes).length) {
      currentElement[options.declarationKey][options.attributesKey] = attributes
    }
    if (options.addParent) {
      currentElement[options.declarationKey][options.parentKey] = currentElement
    }
  } else {
    if (options.ignoreInstruction) {
      return
    }
    if (options.trim) {
      instruction.body = instruction.body.trim()
    }
    const value = {}
    if (options.instructionHasAttributes && Object.keys(attributes).length) {
      value[instruction.name] = {}
      value[instruction.name][options.attributesKey] = attributes
    } else {
      value[instruction.name] = instruction.body
    }
    addField('instruction', value)
  }
}

function onStartElement(name, attributes) {
  let element
  if (typeof name === 'object') {
    attributes = name.attributes
    name = name.name
  }
  attributes = manipulateAttributes(attributes)
  if ('elementNameFn' in options) {
    name = options.elementNameFn(name, currentElement)
  }
  if (options.compact) {
    element = {}
    if (
      !options.ignoreAttributes &&
      attributes &&
      Object.keys(attributes).length
    ) {
      element[options.attributesKey] = {}
      let key
      for (key in attributes) {
        if (Object.prototype.hasOwnProperty.call(attributes, key)) {
          element[options.attributesKey][key] = attributes[key]
        }
      }
    }
    if (
      !(name in currentElement) &&
      (isArray(options.alwaysArray)
        ? options.alwaysArray.indexOf(name) !== -1
        : options.alwaysArray)
    ) {
      currentElement[name] = []
    }
    if (currentElement[name] && !isArray(currentElement[name])) {
      currentElement[name] = [currentElement[name]]
    }
    if (isArray(currentElement[name])) {
      currentElement[name].push(element)
    } else {
      currentElement[name] = element
    }
  } else {
    if (!currentElement[options.elementsKey]) {
      currentElement[options.elementsKey] = []
    }
    element = {}
    element[options.typeKey] = 'element'
    element[options.nameKey] = name
    if (
      !options.ignoreAttributes &&
      attributes &&
      Object.keys(attributes).length
    ) {
      element[options.attributesKey] = attributes
    }
    if (options.alwaysChildren) {
      element[options.elementsKey] = []
    }
    currentElement[options.elementsKey].push(element)
  }
  element[options.parentKey] = currentElement // will be deleted in onEndElement() if !options.addParent
  currentElement = element
}

function onText(text) {
  if (options.ignoreText) {
    return
  }
  if (!text.trim() && !options.captureSpacesBetweenElements) {
    return
  }
  if (options.trim) {
    text = text.trim()
  }
  if (options.nativeType) {
    text = nativeType(text)
  }
  if (options.sanitize) {
    text = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }
  addField('text', text)
}

function onComment(comment) {
  if (options.ignoreComment) {
    return
  }
  if (options.trim) {
    comment = comment.trim()
  }
  addField('comment', comment)
}

function onEndElement() {
  const parentElement = currentElement[options.parentKey]
  if (!options.addParent) {
    delete currentElement[options.parentKey]
  }
  currentElement = parentElement
}

function onCdata(cdata) {
  if (options.ignoreCdata) {
    return
  }
  if (options.trim) {
    cdata = cdata.trim()
  }
  addField('cdata', cdata)
}

function onDoctype(doctype) {
  if (options.ignoreDoctype) {
    return
  }
  doctype = doctype.replace(/^ /, '')
  if (options.trim) {
    doctype = doctype.trim()
  }
  addField('doctype', doctype)
}

export default function xml2js(xml, userOptions) {
  const parser = sax.parser(true, {})
  parser.ignoreStrictError = function (msg) {
    if (msg === 'Attribute without value') return true // 允许属性值不填
    if (msg === 'Invalid character in entity name') return true // 属性值中 & 等符号是允许的
  }
  const result = {}
  currentElement = result

  options = validateOptions(userOptions)

  parser.opt = { strictEntities: true }
  parser.onopentag = function (name, attributes) {
    onStartElement(name, attributes)
    currentElement._position = parser.startTagPosition
    // currentElement._lineColumn = (parser.line + 1) + ':' + parser.column;
  }
  parser.ontext = onText
  parser.oncomment = onComment
  parser.onclosetag = onEndElement
  parser.onerror = function (error) {
    error.note = error
    try {
      const errLine = xml.split('\n')[parser.line]
      error.message += '\nlineText: ' + errLine
    } catch (e) {
      // noop
    }
  }
  parser.oncdata = onCdata
  parser.ondoctype = onDoctype
  parser.onprocessinginstruction = onInstruction

  parser.write(xml).close()

  if (result[options.elementsKey]) {
    const temp = result[options.elementsKey]
    delete result[options.elementsKey]
    result[options.elementsKey] = temp
    delete (<any>result).text
  }

  return result
}
