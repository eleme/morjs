'use strict'

const {
  isEventAttr,
  isCatchEventAttr,
  getEventName,
  isNativeEvent,
  getNativeEventName,
  getNativePropName
} = require('../templateEvents')

describe('@morjs/plugin-compiler-alipay - templateEvents.test.js', () => {
  describe('isEventAttr', () => {
    it('should return true for event attributes', () => {
      expect(isEventAttr('onClick')).toBe(true)
      expect(isEventAttr('onInput')).toBe(true)
      expect(isEventAttr('onCustomEvent')).toBe(true)
    })

    it('should return false for non-event attributes', () => {
      expect(isEventAttr('class')).toBe(false)
      expect(isEventAttr('style')).toBe(false)
      expect(isEventAttr('value')).toBe(false)
    })
  })

  describe('isCatchEventAttr', () => {
    it('should return true for catch event attributes', () => {
      expect(isCatchEventAttr('catchClick')).toBe(true)
      expect(isCatchEventAttr('catchInput')).toBe(true)
      expect(isCatchEventAttr('catchCustomEvent')).toBe(true)
    })

    it('should return false for non-catch event attributes', () => {
      expect(isCatchEventAttr('class')).toBe(false)
      expect(isCatchEventAttr('style')).toBe(false)
      expect(isCatchEventAttr('value')).toBe(false)
    })
  })

  describe('getEventName', () => {
    it('should return event name without on or catch prefix', () => {
      expect(getEventName('onClick')).toBe('click')
      expect(getEventName('onInput')).toBe('input')
      expect(getEventName('catchCustomEvent')).toBe('customEvent')
    })

    it('should return empty string for non-event attributes', () => {
      expect(getEventName('class')).toBe('')
      expect(getEventName('style')).toBe('')
      expect(getEventName('value')).toBe('')
    })
  })

  describe('isNativeEvent', () => {
    it('should return true for common native events', () => {
      expect(isNativeEvent('tap', 'view')).toBe(true)
      expect(isNativeEvent('transitionend', 'view')).toBe(true)
    })

    it('should return true for tag specific native events', () => {
      expect(isNativeEvent('appear', 'view')).toBe(true)
      expect(isNativeEvent('change', 'swiper')).toBe(true)
    })

    it('should return false for non-native events', () => {
      expect(isNativeEvent('click', 'view')).toBe(false)
      expect(isNativeEvent('input', 'input')).toBe(false)
    })
  })

  describe('getNativeEventName', () => {
    it('should return corresponding native event name for common events', () => {
      expect(getNativeEventName('longTap', 'view')).toBe('longpress')
      expect(getNativeEventName('touchStart', 'view')).toBe('touchstart')
    })

    it('should return corresponding native event name for tag specific events', () => {
      expect(getNativeEventName('scrollToUpper', 'scroll-view')).toBe(
        'scrolltoupper'
      )
      expect(getNativeEventName('change', 'checkbox')).toBe('tap')
    })

    it('should return input event name if no corresponding native event found', () => {
      expect(getNativeEventName('input', 'input')).toBe('input')
    })
  })

  describe('getNativePropName', () => {
    it('should return corresponding native prop name for tag specific props', () => {
      expect(getNativePropName('slider', 'background-color')).toBe(
        'backgroundColor'
      )
      expect(getNativePropName('slider', 'active-color')).toBe('activeColor')
    })

    it('should return the same prop name if no corresponding native prop found', () => {
      expect(getNativePropName('view', 'class')).toBe('class')
      expect(getNativePropName('input', 'value')).toBe('value')
    })
  })
})
