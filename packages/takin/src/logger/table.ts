import chalk, { Color, Modifiers } from 'chalk'
import { pad, padEnd, padStart, repeat, truncate } from 'lodash'
import wcwidth from 'wcwidth'
import { isSupportColorModifier } from '../utils/colorModifierSupport'

type SupportColorsOrModifiers = typeof Color | typeof Modifiers

export type CliTableOptions = Partial<{
  chars: Partial<
    Record<
      | 'top'
      | 'top-mid'
      | 'top-left'
      | 'top-right'
      | 'bottom'
      | 'bottom-mid'
      | 'bottom-left'
      | 'bottom-right'
      | 'left'
      | 'left-mid'
      | 'mid'
      | 'mid-mid'
      | 'right'
      | 'right-mid'
      | 'middle',
      string
    >
  >
  truncate: string
  colors: boolean
  colWidths: number[]
  colAligns: Array<'left' | 'middle' | 'right'>
  style: Partial<{
    'padding-left': number
    'padding-right': number
    head: SupportColorsOrModifiers[]
    border: SupportColorsOrModifiers[]
    compact: boolean
  }>
  head: string[]
  rows: string[][]
}>

/**
 * 用于生成终端表格
 */
export class ConsoleCliTable extends Array {
  private options: CliTableOptions
  constructor(options?: CliTableOptions) {
    super()

    this.options = this.mergeOptions(
      {
        // prettier-ignore
        chars: {
          'middle': '│',
          'left': '│',
          'right': '│',
          'top-left':   '┌','top-mid':   '┬','top':   '─','top-right':   '┐',
          'left-mid':   '├','mid-mid':   '┼','mid':   '─','right-mid':   '┤',
          'bottom-left':'└','bottom-mid':'┴','bottom':'─','bottom-right':'┘',
        },
        truncate: '…',
        colWidths: [],
        colAligns: [],
        style: {
          'padding-left': 1,
          'padding-right': 1,
          head: isSupportColorModifier() ? ['bold', 'cyan'] : ['cyan'],
          border: ['cyan'],
          compact: false
        },
        head: []
      },
      options || {}
    )

    if (options && options.rows) {
      for (let i = 0; i < options.rows.length; i++) {
        this.push(options.rows[i])
      }
    }
  }

  private mergeOptions<T extends Record<string, any>>(defaults: T, opts: T): T {
    for (const p in opts) {
      if (p === '__proto__' || p === 'constructor' || p === 'prototype') {
        continue
      }
      if (opts[p] && opts[p].constructor && opts[p].constructor === Object) {
        defaults[p] = defaults[p] || ({} as any)
        this.mergeOptions(defaults[p], opts[p])
      } else {
        defaults[p] = opts[p]
      }
    }
    return defaults
  }

  get width(): number {
    const str = this.toString().split('\n')
    if (str.length) return str[0].length
    return 0
  }

  /**
   * For consideration of terminal "color" programs like colors.js,
   * which can add ANSI escape color codes to strings,
   * we destyle the ANSI color escape codes for padding calculations.
   *
   * see: http://en.wikipedia.org/wiki/ANSI_escape_code
   */
  private strlen(str: string): number {
    // eslint-disable-next-line no-control-regex
    const code = /\u001b\[(?:\d*;){0,5}\d*m/g
    const stripped = ('' + str).replace(code, '')
    const split = stripped.split('\n')
    return split.reduce(function (memo, s) {
      const len = wcwidth(s)
      return len > memo ? len : memo
      // return s.length > memo ? s.length : memo
    }, 0)
  }

  render(): string {
    let ret = ''
    const options = this.options
    const style = options.style || {}
    const head = options.head || []
    const chars = options.chars || {}
    const truncater = options.truncate
    const colWidths = options.colWidths || new Array(head.length)
    let totalWidth = 0

    const getWidth = (
      obj: string | { text: string; width?: number }
    ): number => {
      return typeof obj === 'object' && obj.width !== undefined
        ? obj.width
        : (typeof obj === 'object' ? this.strlen(obj.text) : this.strlen(obj)) +
            (style['padding-left'] || 0) +
            (style['padding-right'] || 0)
    }

    // renders a string, by padding it or truncating it
    const renderString = (
      str: { text: string } | string,
      index: number
    ): string => {
      str = String(typeof str === 'object' && str.text ? str.text : str)
      const length = this.strlen(str)
      const width =
        colWidths[index] -
        (style['padding-left'] || 0) -
        (style['padding-right'] || 0)
      const align = options.colAligns?.[index] || 'left'

      const padFn =
        align === 'left' ? padEnd : align === 'middle' ? pad : padStart

      return (
        repeat(' ', style['padding-left'] || 0) +
        (length === width
          ? str
          : length < width
          ? padFn(str, width + (str.length - length), ' ')
          : truncater
          ? truncate(str, {
              length: width,
              omission: truncater
            })
          : str) +
        repeat(' ', style['padding-right'] || 0)
      )
    }

    if (!head.length && !this.length) return ''

    if (!colWidths.length) {
      let allRows = this.slice(0)
      if (head.length) {
        allRows = allRows.concat([head])
      }

      allRows.forEach(function (cells) {
        // horizontal (arrays)
        if (typeof cells === 'object' && cells.length) {
          extractColumnWidths(cells)

          // vertical (objects)
        } else {
          const header_cell = Object.keys(cells)[0],
            value_cell = cells[header_cell]

          colWidths[0] = Math.max(colWidths[0] || 0, getWidth(header_cell) || 0)

          // cross (objects w/ array values)
          if (typeof value_cell === 'object' && value_cell.length) {
            extractColumnWidths(value_cell, 1)
          } else {
            colWidths[1] = Math.max(
              colWidths[1] || 0,
              getWidth(value_cell) || 0
            )
          }
        }
      })
    }

    totalWidth =
      (colWidths.length === 1
        ? colWidths[0]
        : colWidths.reduce(function (a, b) {
            return a + b
          })) +
      colWidths.length +
      1

    function extractColumnWidths(
      arr: (string | { text: string })[],
      offset: number = 0
    ) {
      offset = offset || 0
      arr.forEach(function (cell, i) {
        colWidths[i + offset] = Math.max(
          colWidths[i + offset] || 0,
          getWidth(cell) || 0
        )
      })
    }

    // draws a line
    function line(
      line: string = '',
      left: string = '',
      right: string = '',
      intersection: string = ''
    ): string {
      let width = 0
      line = left + repeat(line, totalWidth - 2) + right

      colWidths.forEach(function (w, i) {
        if (i === colWidths.length - 1) return
        width += w + 1
        line = line.substr(0, width) + intersection + line.substr(width + 1)
      })

      return applyStyles(options.style?.border, line)
    }

    // draws the top line
    function lineTop() {
      const l = line(
        chars.top,
        chars['top-left'] || chars.top,
        chars['top-right'] || chars.top,
        chars['top-mid']
      )
      if (l) ret += l + '\n'
    }

    function generateRow(items: string[], style?: SupportColorsOrModifiers[]) {
      const cells: { contents: string[]; height: number }[] = []
      let max_height = 0
      let first_cell_head = false

      // prepare vertical and cross table data
      if (!Array.isArray(items) && typeof items === 'object') {
        const key = Object.keys(items)[0]
        const value = items[key]
        first_cell_head = true

        if (Array.isArray(value)) {
          items = value
          items.unshift(key)
        } else {
          items = [key, value]
        }
      }

      // transform array of item strings into structure of cells
      items.forEach(function (item, i) {
        const contents = item
          .toString()
          .split('\n')
          .reduce(function (memo: string[], l) {
            memo.push(renderString(l, i))
            return memo
          }, [])

        const height = contents.length
        if (height > max_height) {
          max_height = height
        }

        cells.push({ contents: contents, height: height })
      })

      // transform vertical cells into horizontal lines
      const lines = new Array(max_height)
      cells.forEach(function (cell, i) {
        cell.contents.forEach(function (line, j) {
          if (!lines[j]) {
            lines[j] = []
          }
          if (style || (first_cell_head && i === 0 && options.style?.head)) {
            line = applyStyles(options.style?.head, line)
          }

          lines[j].push(line)
        })

        // populate empty lines in cell
        for (let j = cell.height, l = max_height; j < l; j++) {
          if (!lines[j]) {
            lines[j] = []
          }
          lines[j].push(renderString('', i))
        }
      })
      let ret = ''
      lines.forEach(function (line) {
        if (ret.length > 0) {
          ret += '\n' + applyStyles(options.style?.border, chars.left)
        }

        ret +=
          line.join(applyStyles(options.style?.border, chars.middle)) +
          applyStyles(options.style?.border, chars.right)
      })

      return applyStyles(options.style?.border, chars.left) + ret
    }

    function applyStyles(
      styles: SupportColorsOrModifiers[] = [],
      subject?: string
    ): string {
      if (!subject) return ''
      styles.forEach(function (style) {
        subject = chalk[style](subject)
      })
      return subject
    }

    if (head.length) {
      lineTop()

      ret += generateRow(head, style.head) + '\n'
    }

    if (this.length)
      this.forEach(function (cells, i) {
        if (!head.length && i === 0) lineTop()
        else {
          if (
            !style.compact || i < Number(!!head.length)
              ? 1
              : 0 || cells.length === 0
          ) {
            const l = line(
              chars.mid,
              chars['left-mid'],
              chars['right-mid'],
              chars['mid-mid']
            )
            if (l) ret += l + '\n'
          }
        }

        if (
          Object.prototype.hasOwnProperty.call(cells, 'length') &&
          !cells.length
        ) {
          return
        } else {
          ret += generateRow(cells) + '\n'
        }
      })

    const l = line(
      chars.bottom,
      chars['bottom-left'] || chars.bottom,
      chars['bottom-right'] || chars.bottom,
      chars['bottom-mid']
    )
    if (l) ret += l
    // trim the last '\n' if we didn't add the bottom decoration
    else ret = ret.slice(0, -1)

    return ret
  }

  override toString(): string {
    return this.render()
  }
}
