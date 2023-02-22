import {
  EntryBuilderHelpers,
  EntryFileType,
  EntryItem,
  MOR_HELPER_FILE,
  Plugin,
  Runner,
  SourceTypes
} from '@morjs/utils'
import { isSimilarTarget } from '../constants'

/**
 * 支付宝 template 文件转译
 */
export default class AlipayCompilerTemplateParserPlugin implements Plugin {
  name = 'AlipayCompilerTemplateParserPlugin'

  entryBuilder: EntryBuilderHelpers

  apply(runner: Runner) {
    let entryHelper: EntryBuilderHelpers
    runner.hooks.entryBuilder.tap(this.name, function (e) {
      entryHelper = e
    })

    runner.hooks.beforeRun.tap(this.name, () => {
      const { sourceType, target } = runner.userConfig

      // 仅当 模版文件 是 支付宝 源码 且 编译目标不是 支付宝小程序 时执行该插件
      if (sourceType !== SourceTypes.alipay) return
      if (sourceType === target) return
      if (isSimilarTarget(target)) return

      const compilerPlugins = runner.methods.invoke(
        'getComposedCompilerPlugins'
      )

      const isSupportSjsContent = compilerPlugins?.isSupportSjsContent?.[target]
      const sjsTagName = compilerPlugins?.sjsTagName?.[target]
      const sjsSrcAttrName = compilerPlugins?.sjsSrcAttrName?.[target]
      const sjsModuleAttrName = compilerPlugins?.sjsModuleAttrName?.[target]
      const sjsFileType = compilerPlugins?.fileType?.[target]?.sjs

      if (!isSupportSjsContent) return
      if (!sjsTagName) return
      if (!sjsModuleAttrName) return
      if (!sjsSrcAttrName) return

      const sjsFileName = `${MOR_HELPER_FILE()}${sjsFileType}`
      const sjsHelperName = 'morSjs'
      const sjsHelperFnName = `${sjsHelperName}.s`
      runner.hooks.postprocessorParser.tap(this.name, (content, options) => {
        if (
          options.fileInfo.entryFileType === EntryFileType.template &&
          content &&
          content.includes(sjsHelperFnName)
        ) {
          // 追加 sjs 文件
          this.addSjsHelperSupport(entryHelper, sjsFileName)

          // 计算相对引用路径
          const importPath = entryHelper.getRelativePathFor(
            entryHelper.getEntryByFilePath(options.fileInfo.path),
            { fullEntryName: sjsFileName, entryName: sjsFileName } as EntryItem,
            true
          )

          // 注入 sjs 引用
          return `<${sjsTagName} ${sjsModuleAttrName}='${sjsHelperName}' ${sjsSrcAttrName}='${importPath}'></${sjsTagName}>\n${content}`
        }

        return content
      })
    })
  }

  addSjsHelperSupport(entryHelper: EntryBuilderHelpers, fileName: string) {
    if (entryHelper.additionalEntrySources.has(fileName)) return

    entryHelper.setEntrySource(
      fileName,
      `
// 驼峰转中划线
// 支付宝不支持正则
function hump2dash(humpStr) {
    var result = [];
    var len = humpStr.length;
    for (var i = 0; i < len; i++) {
        var cur = humpStr[i];
        var unicode = humpStr.charCodeAt(i);
        // unicode 大于 65 小于 90 为大写字符
        if (unicode >= 65 && unicode <= 90) {
            result.push(("-" + cur).toLowerCase());
        }
        else {
            result.push(cur);
        }
    }
    return result.join('');
}
// 微信无法使用 Object.keys for of for in 遍历对象
// 序列化后自行实现
function objectKeys(obj) {
    var jsonString = JSON.stringify(obj);
    var step = 0;
    var nested = 0;
    var keys = [];
    // 获取当前的 key，从 " 的下一个字符 到 " 的前一个字符
    function getCurrentKey(str, begin) {
        var len = str.length;
        var currentKeyChar = [];
        for (var i = begin; i < len; i++) {
            if (str[i] !== '"')
                currentKeyChar.push(str[i]);
            if (str[i] === '"')
                return currentKeyChar.join('');
        }
        return '';
    }
    function walk() {
        var targetChar = jsonString[step];
        if (!targetChar)
            return;
        // 从 {" 的下一个字符开始
        if (targetChar === '{' && nested === 0) {
            nested += 1; // 层级 + 1
            var currentKey = getCurrentKey(jsonString, step + 2);
            if (currentKey)
                keys.push(currentKey);
            step += currentKey.length + 2;
            walk();
            return;
        }
        // 从 ," 的下一个字符开始
        if (targetChar === ',' && jsonString[step + 1] === '"') {
            var currentKey = getCurrentKey(jsonString, step + 2);
            if (currentKey)
                keys.push(currentKey);
            step += currentKey.length + 2;
            walk();
            return;
        }
        // 匹配到当前层级的结束
        if (targetChar === '}')
            nested -= 1;
        step += 1;
        walk();
    }
    walk(step);
    return keys;
}
// sjs 脚本支持度有限，手动实现 assign
function assign(target, from) {
    objectKeys(from).forEach(function (key) {
        target[key] = from[key];
    });
    return target;
}

// 对象样式支持
function s(obj) {
  if (!obj) return obj;

  if (obj.constructor === 'Object') {
    return objectKeys(obj).map(function (key) { return hump2dash(key) + ": " + obj[key] + ";"; }).join('');
  }

  return obj;
}

module.exports = {
  s: s
};
`,
      'additional'
    )
  }
}
