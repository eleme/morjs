import { html, internalProperty, property } from 'lit-element'
import { BaseElement } from '../../../../baseElement'
import { defineElement } from '../../../../utils'
import { FORMATE_MAP } from './constants'
import { Styles } from './index.style'
import {
  buildResult,
  getList,
  getListValue,
  isContain,
  onlyTime
} from './utils'

class DatePicker extends BaseElement {
  currentYear
  currentMonth
  currentDay
  currentHour
  currentMinute
  onlyHasTime: false
  methods = () => {}
  currentFormat = FORMATE_MAP[0]

  @property() format = ''
  @property() currentDate = ''
  @property() startDate = ''
  @property() endDate = ''
  @internalProperty() years = {}
  @internalProperty() months = {}
  @internalProperty() days = {}
  @internalProperty() hours = {}
  @internalProperty() minutes = {}
  @internalProperty() initValue = []

  connectedCallback() {
    super.connectedCallback()

    if (FORMATE_MAP.indexOf(this.format) > -1) this.currentFormat = this.format
    this._init()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
  }

  static get styles() {
    return Styles
  }

  _set(property, value) {
    this[property] = value
    return this
  }

  _init() {
    const format = this.currentFormat
    const { currentDate, startDate, endDate } = this
    const listCache = getList({ format, currentDate, startDate, endDate })
    const onlyHasTime = onlyTime(this.currentFormat)

    this._set('methods', listCache)
      ._set('onlyHasTime', onlyHasTime)
      .getYears()
      .getMonths()
      .getDays()
      .getHours()
      .getMinutes()
      .updateInitValue()
  }

  updateInitValue() {
    const onlyHasTime = onlyTime(this.currentFormat)

    const initValue = onlyHasTime
      ? [this.currentHour, this.currentMinute]
      : [
          this.currentYear,
          this.currentMonth,
          this.currentDay,
          this.currentHour,
          this.currentMinute
        ]

    this._set('initValue', initValue)

    return this
  }

  onConfirm() {
    const year = getListValue(this.years, this.currentYear)
    const month = getListValue(this.months, this.currentMonth)
    const day = getListValue(this.days, this.currentDay)
    const hour = getListValue(this.hours, this.currentHour)
    const minute = getListValue(this.minutes, this.currentMinute)

    const result = buildResult({
      year,
      month,
      day,
      hour,
      minute,
      format: this.currentFormat
    })
    this.dispatch(result)
  }

  getYears(index?) {
    const { getYears } = this.methods() as any
    const years = getYears(index)

    this._set('years', years)._set('currentYear', years.currentIndex)

    return this
  }

  getMonths(index?) {
    const { getMonths } = this.methods() as any
    const months = getMonths(index)

    this._set('months', months)._set('currentMonth', months.currentIndex)

    return this
  }

  getDays(index?) {
    const { getDays } = this.methods() as any
    const days = getDays(index)

    this._set('days', days)._set('currentDay', days.currentIndex)

    return this
  }

  getHours(index?) {
    const { getHours } = this.methods() as any
    const hours = getHours(index)

    this._set('hours', hours)._set('currentHour', hours.currentIndex)

    return this
  }

  getMinutes(index?) {
    const { getMinutes } = this.methods() as any
    const minutes = getMinutes(index)

    this._set('minutes', minutes)._set('currentMinute', minutes.currentIndex)

    return this
  }

  yearUpdate(index) {
    if (this.currentYear !== index) {
      this.getYears(index).getMonths().getDays().getHours().getMinutes()
    }
  }

  monthsUpdate(index) {
    if (this.currentMonth !== index) {
      this.getMonths(index).getDays().getHours().getMinutes()
    }
  }

  daysUpdate(index) {
    if (this.currentDay !== index) {
      this.getDays(index).getHours().getMinutes()
    }
  }

  hoursUpdate(index) {
    if (this.currentHour !== index) {
      this.getHours(index).getMinutes()
    }
  }

  minutesUpdate(index) {
    if (this.currentMinute !== index) {
      this.getMinutes(index)
    }
  }

  handleChange(event) {
    const value = event.detail.value
    const contains = isContain(this.currentFormat)

    if (contains('yyyy')) this.yearUpdate(value[0])
    if (contains('MM')) this.monthsUpdate(value[1])
    if (contains('dd')) this.daysUpdate(value[2])
    if (contains('HH')) {
      if (this.onlyHasTime) this.hoursUpdate(value[0])
      else this.hoursUpdate(value[3])
    }
    if (contains('mm')) {
      if (this.onlyHasTime) this.minutesUpdate(value[1])
      else this.minutesUpdate(value[4])
    }

    this.updateInitValue()
  }

  dispatch(value) {
    this.dispatchEvent(
      new CustomEvent('select', {
        detail: { date: value },
        bubbles: true,
        composed: true
      })
    )
  }

  renderColumn({ list }: any) {
    if (!Array.isArray(list) || list.length < 1) return null

    return html`
      <tiga-picker-view-column
        >${list.map(
          (item) => html`<div>${item}</div>`
        )}</tiga-picker-view-column
      >
    `
  }

  render() {
    return html`
      <private-modal
        .show="${true}"
        @confirm=${this.onConfirm}
        @cancel=${() => this.dispatch(undefined)}
        title=${this.title}
      >
        <tiga-picker-view
          slot="content"
          @change=${this.handleChange}
          .value=${this.initValue}
          indicator-style="border-top: 1px solid #ddd;border-bottom: 1px solid #ddd;background-color:#f5f5f9;"
        >
          ${html`${this.renderColumn(this.years)}`}
          ${html`${this.renderColumn(this.months)}`}
          ${html`${this.renderColumn(this.days)}`}
          ${html`${this.renderColumn(this.hours)}`}
          ${html`${this.renderColumn(this.minutes)}`}
        </tiga-picker-view>
      </private-modal>
    `
  }
}

defineElement('private-date-picker', DatePicker)
