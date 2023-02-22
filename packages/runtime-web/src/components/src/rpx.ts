// NOTE: 组件不能转REM，会导致无法自定义根节点fontsize!!!
export function rpxToRem(rpxValue: number) {
  return `${rpxValue / 2}px`
}
