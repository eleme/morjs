'use strict'

const { asArray, prompts } = require('@morjs/utils')
const generate = require('../generate')
const { generatePageOrComponent } = generate

jest.mock('@morjs/utils', () => ({
  asArray: jest.fn(),
  CommandOptions: jest.fn(),
  fastGlob: {
    stream: jest.fn()
  },
  prompts: {
    prompt: jest.fn()
  },
  Runner: jest.fn()
}))
jest.mock('path', () => ({
  resolve: jest.fn(),
  join: jest.fn(),
  extname: jest.fn()
}))

describe('@morjs/plugin-generator - generate.test.js', () => {
  describe('generatePageOrComponent', () => {
    let command
    let runner
    let fileNames

    beforeEach(() => {
      command = {
        options: {},
        args: []
      }
      runner = {}
      fileNames = []
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should prompt user for generator type if not provided', async () => {
      prompts.prompt.mockResolvedValueOnce({ type: 'page' })

      await generatePageOrComponent(command, runner, fileNames)

      expect(prompts.prompt).toHaveBeenCalledWith(
        [
          ...{
            type: 'select',
            name: 'type',
            message: '请选择生成器类型',
            choices: [
              { title: '生成页面 (page)', value: 'page' },
              { title: '生成组件 (component)', value: 'component' }
            ]
          }
        ],
        expect.any(Object)
      )
    })

    it('should prompt user for source type if not provided', async () => {
      prompts.prompt.mockResolvedValueOnce({ sourceType: 'wechat' })

      command.options.name = 'page'

      await generatePageOrComponent(command, runner, fileNames)

      expect(prompts.prompt).toHaveBeenCalledWith(
        [
          ...{
            type: 'select',
            name: 'sourceType',
            message: '请选择源码类型',
            choices: [
              { title: '微信小程序 DSL', value: 'wechat' },
              { title: '支付宝小程序 DSL', value: 'alipay' }
            ]
          }
        ],
        expect.any(Object)
      )
    })

    it('should prompt user for srcPath if not provided', async () => {
      prompts.prompt.mockResolvedValueOnce({ srcPath: 'src' })

      command.options.name = 'page'
      command.options.sourceType = 'wechat'

      await generatePageOrComponent(command, runner, fileNames)

      expect(prompts.prompt).toHaveBeenCalledWith(
        [
          ...{
            type: 'select',
            name: 'srcPath',
            message: expect.any(Function),
            choices: expect.any(Array)
          }
        ],
        expect.any(Object)
      )
    })

    it('should prompt user for typescript if not provided', async () => {
      prompts.prompt.mockResolvedValueOnce({ typescript: true })

      command.options.name = 'page'
      command.options.sourceType = 'wechat'
      command.options.srcPath = 'src'

      await generatePageOrComponent(command, runner, fileNames)

      expect(prompts.prompt).toHaveBeenCalledWith(
        [
          {
            type: 'toggle',
            name: 'typescript',
            message: '是否使用 Typescript',
            initial: true,
            active: '是',
            inactive: '否'
          }
        ],
        expect.any(Object)
      )
    })

    it('should prompt user for cssParser if not provided', async () => {
      prompts.prompt.mockResolvedValueOnce({ cssParser: 'less' })

      command.options.name = 'page'
      command.options.sourceType = 'wechat'
      command.options.srcPath = 'src'
      command.options.typescript = true

      await generatePageOrComponent(command, runner, fileNames)

      expect(prompts.prompt).toHaveBeenCalledWith(
        [
          {
            type: 'select',
            name: 'cssParser',
            message: '请选择 CSS 预处理器',
            choices: [
              { title: 'less', value: 'less' },
              { title: 'sass', value: 'sass' },
              { title: 'css', value: '' }
            ]
          }
        ],
        expect.any(Object)
      )
    })
  })

  describe('generate', () => {
    let command
    let runner

    beforeEach(() => {
      command = {
        options: {},
        args: []
      }
      runner = {}
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should call generatePageOrComponent with correct arguments', async () => {
      const fileNames = ['page1', 'page2']
      asArray.mockReturnValueOnce(fileNames)

      await generate(command, runner)

      expect(generatePageOrComponent).toHaveBeenCalledWith(
        command,
        runner,
        fileNames,
        null
      )
    })

    it('should call generatePageOrComponent with type as file name if type is not supported', async () => {
      const type = 'unsupported'
      const fileNames = ['page1', 'page2']
      asArray.mockReturnValueOnce(fileNames)
      command.args = [type]

      await generate(command, runner)

      expect(generatePageOrComponent).toHaveBeenCalledWith(
        command,
        runner,
        [...fileNames, type],
        null
      )
    })
  })
})
