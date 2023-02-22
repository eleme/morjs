import React from 'react'
// eslint-disable-next-line node/no-missing-import
import { Block } from './components/block'
// eslint-disable-next-line node/no-missing-import
import { Slot } from './components/slot'
import { toJsonString } from './dsl/attribute-value'
import { axmlApi } from './dsl/axml-api'
import { bindThis, getEvent, registEvents } from './dsl/event'
import getForValue from './dsl/for'
import ref from './dsl/ref'
import { autoSyncRootFontSize, setRootFontSizeForRem } from './dsl/rpx'
import { createStyle } from './dsl/style'
import TemplateManager from './dsl/template'
// import TwoWayBinding from './dsl/two-way-binding';
import './public/app'
import { Component, Page } from './public/index'
export default {
  Component,
  Page,
  createTemplateManager: function () {
    return new TemplateManager()
  },
  Slot,
  Block,
  slotScope(f, name) {
    // 主要是为了防止因为打包的问题，将方法的名称重命名，导致slot匹配不到
    if (name) {
      f._name = name
    }
    return f
  },
  createStyle,
  // 事件绑定
  getEvent,
  // 对方法绑定this
  bindThis,
  registEvents,
  // ref 绑定
  ref,
  // 合并配置
  mergeConfig(appConfig, config) {
    // NOTE: appConfig 为全局配置，config为局部配置，但是config 的优先级大于 appConfig
    // 这个版本主要是window。而且目前也不需要区分page 还是 component 。相关的配置基本上随着版本走的。
    // 这里也算是预留了一个未来配置扩展扣子
    const result = {
      ...appConfig,
      ...config,
      window: { ...appConfig.window, ...config.window }
    }
    return result
  },
  toJsonString,
  // 将内容转换成字符串
  // TODO： 要改名字，改成 renderContent
  getString(content) {
    try {
      if (content === undefined || content == null) {
        return ''
      }
      // 如果是函数，那么直接返回函数
      if (typeof content === 'function') return content

      if (React.isValidElement(content)) {
        return content
      }
      return content.toString()
    } catch (err) {
      console.log(err)
      return ''
    }
  },
  // 根据给定的value，获得for指令可用的数组
  getForValue,
  // 创建一个专门提供给axml 的api
  axmlApi,
  // 手动设置根节点fontsize
  setRootFontSizeForRem,
  // 自动同步根节点的 font-size, 并设置 ROOT_VALUE
  autoSyncRootFontSize
}
