import {
  dataBindingNode,
  eventAttributeNode,
  EventAttributeNode
} from '../../types'

export default function (attName: string, value: string): EventAttributeNode {
  if (isEventAttribute(attName)) {
    const isCatch = attName.startsWith('catch')
    let eventName
    if (isCatch) {
      eventName = attName.substring(5)
    } else {
      eventName = attName.substring(2)
    }
    eventName = eventName.replace(eventName[0], eventName[0].toLowerCase())
    return eventAttributeNode(eventName, dataBindingNode(value), isCatch)
  }
  return null
}

export function isEventAttribute(attName: string) {
  if (attName !== 'on' && attName !== 'catch') {
    let startLetter
    if (attName.startsWith('on')) {
      startLetter = attName.substring(2, 3)
    }
    if (attName.startsWith('catch')) {
      startLetter = attName.substring(5, 6)
    }
    if (startLetter && /[A-Z]/.test(startLetter)) {
      return true
    }
  }
  return false
}
