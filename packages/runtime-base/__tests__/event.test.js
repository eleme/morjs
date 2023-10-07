'use strict'

const { createEvent } = require('..')

describe('@morjs/runtime-base - event.test.js', () => {
  describe('Event Management', () => {
    let event

    beforeEach(() => {
      event = createEvent('test')
    })

    afterEach(() => {
      event = null
    })

    test('on() should register event listener', () => {
      const handler = jest.fn()
      event.on('event1', handler)
      event.emit('event1', 'data')
      expect(handler).toHaveBeenCalledWith('data')
    })

    test('off() should remove event listener', () => {
      const handler = jest.fn()
      event.on('event1', handler)
      event.off('event1', handler)
      event.emit('event1', 'data')
      expect(handler).not.toHaveBeenCalled()
    })

    test('emit() should trigger event listener', () => {
      const handler = jest.fn()
      event.on('event1', handler)
      event.emit('event1', 'data')
      expect(handler).toHaveBeenCalledWith('data')
    })

    test('once() should register event listener that executes only once', () => {
      const handler = jest.fn()
      event.once('event1', handler)
      event.emit('event1', 'data')
      event.emit('event1', 'data')
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })
})
