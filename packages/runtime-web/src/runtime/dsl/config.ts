export function mergeConfig(appConfig, config) {
  // NOTE: appConfig 为全局配置，config为局部配置，但是config 的优先级大于 appConfig
  // 这个版本主要是window。而且目前也不需要区分page 还是 component 。相关的配置基本上随着版本走的。
  // 这里也算是预留了一个未来配置扩展扣子
  const result = {
    ...appConfig,
    ...config,
    window: { ...appConfig.window, ...config.window }
  }
  return result
}
