import type { MorSolution } from '@morjs/api'

/*
 * 若 solution 有设置参数 IRuntimeSolution<%= _.upperFirst(_.camelCase(name)) %>Options
 * 请将 options 的 interface 给 export 出去，方便可能需要集成的使用方进行引用
 */
export interface IRuntimeSolution<%= _.upperFirst(_.camelCase(name)) %>Options {
  /* Solution 的 Options 配置 */
}

export default function RuntimeSolution<%= _.upperFirst(_.camelCase(name)) %>(options: IRuntimeSolution<%= _.upperFirst(_.camelCase(name)) %>Options): MorSolution {
  /* options 的前置逻辑处理 */

  return () => {
    const plugins = [
      /* 创建各 Plugin 实例 */
    ]
    return { plugins }
  }
}
