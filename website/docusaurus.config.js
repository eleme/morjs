const navbar = require('./config/navbar')
const footer = require('./config/footer')

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'MorJS',
  tagline: 'MorJS 小程序多端研发框架',
  favicon: 'img/mor-icon.svg',
  url: 'https://mor.eleme.io',
  baseUrl: '/',
  organizationName: 'eleme',
  projectName: 'morjs',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'throw',
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans']
  },
  themeConfig: {
    navbar,
    footer,
    // 告示条配置
    // announcementBar: {
    //   id: 'announcement-bar-20230202',
    //   content: 'MorJS 开箱即用的小程序多端研发框架 <a href="/docs/guides/README">更多</a>',
    //   isCloseable: true,
    //   backgroundColor: '#FFFADA',
    //   textColor: '#091E42',
    // },
    // algolia 搜索配置
    algolia: {
      appId: '5QPTLJ7YVR',
      apiKey: 'aa95c48f32ccd4dd1788b1d279a98397',
      indexName: 'morjs'
    }
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./config/sidebars.js'),
          // 分版配置参考: https://docusaurus.io/docs/versioning#configuring-versioning-behavior
          includeCurrentVersion: true, // 发布的版本包含当前版本
          lastVersion: 'current', // 最新版本
          onlyIncludeVersions: ['current'], // 哪些版本应该被部署
          versions: {
            // 版本元数据的字典
            current: {
              label: '1.0.0',
              path: '/', // 此版本的路径前缀
              badge: true // 文档开头显示一个版本名标记
            }
          }
        },
        // blog: {},
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
        // 将事件数据发送到 Google Analytics 让谷歌搜索到该网站
        // gtag: {
        //   trackingID: 'G-',
        // },
      })
    ]
  ],
  plugins: []
}

// algolia 是在线搜索服务，内网环境下不可用，替换为搜索插件
// delete config.themeConfig.algolia;
// config.plugins.push([
//   require.resolve('@easyops-cn/docusaurus-search-local'),
//   {
//     hashed: true,
//     language: ['zh', 'en'],
//     highlightSearchTermsOnTargetPage: true,
//     explicitSearchResultPath: true,
//   },
// ]);

module.exports = config
