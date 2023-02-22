import { camelcaseOptionName, removeBrackets } from './utils'

interface OptionConfig {
  default?: any
  type?: any[]
}

export default class Option {
  /** Option name */
  name!: string
  /** Option name and aliases */
  names: string[]
  isBoolean?: boolean
  // `required` will be a boolean for options with brackets
  required?: boolean
  config: OptionConfig
  negated: boolean

  constructor(
    public rawName: string,
    public description: string,
    config?: OptionConfig
  ) {
    this.config = Object.assign({}, config)

    // You may use cli.option('--env.* [value]', 'desc') to denote a dot-nested option
    rawName = rawName.replace(/\.\*/g, '')

    this.negated = false
    this.names = this.parse(rawName)
    this.sortNamesAndSetActualName()

    if (this.negated && this.config.default == null) {
      this.config.default = true
    }

    if (rawName.includes('<')) {
      this.required = true
    } else if (rawName.includes('[')) {
      this.required = false
    } else {
      // No arg needed, it's boolean flag
      this.isBoolean = true
    }
  }

  private parse(rawName: string): string[] {
    return removeBrackets(rawName)
      .split(',')
      .map((v: string) => {
        let name = v.trim().replace(/^-{1,2}/, '')
        if (name.startsWith('no-')) {
          this.negated = true
          name = name.replace(/^no-/, '')
        }

        return camelcaseOptionName(name)
      })
  }

  /**
   * 为 option 设置别名
   */
  alias(rawName: string) {
    const names = this.parse(rawName)
    for (const name of names) {
      if (this.names.includes(name)) continue
      this.names.push(name)
    }
    this.sortNamesAndSetActualName()
  }

  private sortNamesAndSetActualName() {
    this.names = (this.names || []).sort((a, b) =>
      a.length > b.length ? 1 : -1
    ) // Sort names

    // Use the longest name (last one) as actual option name
    this.name = this.names[this.names.length - 1]
  }
}

export type { OptionConfig }
