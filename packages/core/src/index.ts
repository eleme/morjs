import { aApp, createApp, registerAppAdapters, wApp } from './app'
import {
  aComponent,
  createComponent,
  enhanceComponent,
  MorComponentAdapter,
  registerComponentAdapters,
  wComponent
} from './component'
import {
  aPage,
  createPage,
  enhancePage,
  MorPageAdapter,
  registerPageAdapters,
  wPage
} from './page'
import {
  aPageToComponent,
  PageToComponent,
  wPageToComponent
} from './pageToComponent'
import { aPlugin, createPlugin, wPlugin } from './plugin'
import { init } from './utils/init'
import './utils/polyfill'

export type { GetAppFunction, MorAppInstance } from './app'
export {
  createApp,
  aApp,
  wApp,
  registerAppAdapters,
  aPage,
  wPage,
  registerPageAdapters,
  createComponent,
  enhanceComponent,
  aComponent,
  wComponent,
  registerComponentAdapters,
  createPage,
  enhancePage,
  createPlugin,
  aPlugin,
  wPlugin,
  PageToComponent,
  aPageToComponent,
  wPageToComponent,
  MorPageAdapter,
  MorComponentAdapter,
  init
}
