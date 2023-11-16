import { Block } from './components/block'
import { Slot } from './components/slot'
import { toJsonString } from './dsl/attribute-value'
import { axmlApi } from './dsl/axml-api'
import { mergeConfig } from './dsl/config'
import createCondition from './dsl/createCondition'
import createList from './dsl/createList'
import { bindThis, getEvent, registEvents } from './dsl/event'
import getForValue from './dsl/for'
import ref from './dsl/ref'
import { autoSyncRootFontSize, setRootFontSizeForRem } from './dsl/rpx'
import { slotScope } from './dsl/slot'
import { getString } from './dsl/string'
import { createStyle } from './dsl/style'
import { createTemplateManager } from './dsl/template'
import './public/app'
import { Component, Page } from './public/index'

export default {
  Component,
  $cp: Component,

  Page,
  $pg: Page,

  createTemplateManager,
  $ctm: createTemplateManager,

  Slot,
  $st: Slot,

  Block,
  $bk: Block,

  slotScope,
  $stc: slotScope,

  createStyle,
  $ct: createStyle,

  // 事件绑定
  getEvent,
  $ge: getEvent,

  // 对方法绑定this
  bindThis,
  $bt: bindThis,

  registEvents,
  $re: registEvents,
  // ref 绑定
  ref,
  $rf: ref,

  // 合并配置
  mergeConfig,
  $mg: mergeConfig,

  toJsonString,
  $tjs: toJsonString,
  // 将内容转换成字符串
  // TODO： 要改名字，改成 renderContent
  getString,
  $gt: getString,
  // 根据给定的value，获得for指令可用的数组
  getForValue,
  $gfv: getForValue,
  // 创建一个专门提供给axml 的api
  axmlApi,
  $ap: axmlApi,
  // 手动设置根节点fontsize
  setRootFontSizeForRem,
  $sfr: setRootFontSizeForRem,
  // 自动同步根节点的 font-size, 并设置 ROOT_VALUE
  autoSyncRootFontSize,
  $afz: autoSyncRootFontSize,

  $cd: createCondition,
  $cl: createList
}
