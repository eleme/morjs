import { html, internalProperty, query, queryAll } from 'lit-element'
import { unsafeHTML } from 'lit-html/directives/unsafe-html'
import { BaseElement } from '../../../baseElement'
import '../../../loadable/icon'
import '../../../loadable/input'
import { defineElement } from '../../../utils'
import citySources from './citySources'
import { Styles } from './style'

const defaultHotCityName = [
  '杭州',
  '北京',
  '上海',
  '广州',
  '深圳',
  '成都',
  '重庆',
  '天津',
  '南京',
  '苏州',
  '武汉',
  '西安'
]

const hotCitys = []

const navigation = ['#']
citySources.cityList.forEach((item) => {
  const { cities, idx } = item
  navigation.push(idx)
  cities.forEach((city) => {
    if (defaultHotCityName.includes(city.name)) {
      hotCitys.push(city)
    }
  })
})

class ChooseCity extends BaseElement {
  [propName: string]: any

  private searchValue: string

  @internalProperty()
  searchCitys = []

  static get styles() {
    return Styles
  }

  dispatch(action, options) {
    this.dispatchEvent(
      new CustomEvent(action, {
        detail: options,
        bubbles: true,
        composed: true
      })
    )
  }

  __handleChoose(e) {
    const { long: longitude, lat: latitude, city, code } = e.target.dataset
    if (city) {
      this.dispatch('choose', { longitude, latitude, city, adCode: code })
    }
  }

  __handleClose() {
    this.dispatch('close', {})
  }

  __handleJump(e) {
    const { idx } = e.target.dataset
    if (idx === '#') {
      this.cityList.scrollTo(0, 0)
      return
    }

    const node: any = Array.from(this.cityIdxList).find((node: any) => {
      return node.dataset.idx === idx
    })

    this.cityContent.scrollTo(0, node.offsetTop)
  }

  handleSearch(e) {
    const val = e.detail.value
    this.searchValue = val
    this.searchCitys = []
    if (val) {
      citySources.cityList.forEach((item) => {
        const { cities, idx } = item
        if (idx === val.toUpperCase()) {
          this.searchCitys = this.searchCitys.concat(cities)
        } else {
          cities.forEach((city) => {
            const { name, pinyin } = city
            if (val === name || val === pinyin) {
              this.searchCitys.push(city)
            }
          })
        }
      })
    }
  }

  @queryAll('.city-list-title')
  cityIdxList
  @query('.choose-city-content')
  cityContent

  renderSearchList() {
    if (this.searchCitys.length) {
      return html`<div class="search-city-list" @click="${this.__handleChoose}">
        ${unsafeHTML(
          this.searchCitys
            .map((city) => {
              const { latitude, longitude, name, districtCode } = city
              return `<div class="city-list-cell" data-long="${longitude}" data-lat="${latitude}" data-city="${name}" data-code="${districtCode}">${name}</div>`
            })
            .join('')
        )}
      </div>`
    }

    return html`<div class="no-search-city-list">无结果</div>`
  }

  renderCityList() {
    return html` <div class="choose-navigation" @click="${this.__handleJump}">
        ${unsafeHTML(
          navigation
            .map(
              (idx) =>
                `<div class="navigation-cell" data-idx="${idx}">${idx}</div>`
            )
            .join('')
        )}
      </div>
      <div>
        <div class="hot-city">
          <div class="hot-city__title">热门城市</div>
          <div class="hot-city__list" @click="${this.__handleChoose}">
            ${unsafeHTML(
              hotCitys
                .map((city) => {
                  const { latitude, longitude, name, districtCode } = city
                  return `
                    <div class="hot-city__cell" data-long="${longitude}" data-lat="${latitude}" data-city="${name}" data-code="${districtCode}">${name}</div>
                  `
                })
                .join('')
            )}
          </div>
        </div>
        <div class="city-list" @click="${this.__handleChoose}">
          ${unsafeHTML(
            citySources.cityList
              .map((item) => {
                const { cities, idx } = item
                return `
                  <div class="city-list__card">
                    <div class="city-list-title" data-idx="${idx}">${idx}</div>
                    <div class="city-list-cells">
                      ${cities
                        .map((city) => {
                          const { latitude, longitude, name, districtCode } =
                            city
                          return `
                            <div class="city-list-cell" data-long="${longitude}" data-lat="${latitude}" data-city="${name}" data-code="${districtCode}">${name}</div>
                          `
                        })
                        .join('')}
                    </div>
                  </div>
                `
              })
              .join('')
          )}
        </div>
      </div>`
  }

  render() {
    return html`
      <div class="choose-city">
        <div class="choose-title">城市列表</div>
        <div class="close-wrap" @click="${this.__handleClose}">
          <img
            class="close"
            src="data:image/png;base64,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"
            alt=""
          />
        </div>
        <div class="search-city">
          <tiga-icon
            class="search-icon"
            type="search"
            color="#86909c"
            size="10"
          ></tiga-icon>
          <tiga-input
            class="search-city-input"
            @input="${this.handleSearch}"
            placeholder="输入城市名、拼音或字母查询"
            placeholder-style="font-size: 14px;"
          ></tiga-input>
        </div>
        <div class="choose-city-content">
          ${this.searchValue ? this.renderSearchList() : this.renderCityList()}
        </div>
      </div>
    `
  }
}

defineElement('private-choose-city', ChooseCity)
