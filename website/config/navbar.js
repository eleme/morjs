module.exports = {
  title: 'MorJS',
  logo: {
    alt: 'MorJS',
    src: 'https://img.alicdn.com/imgextra/i1/O1CN017EoZuR20PghATY7Fw_!!6000000006842-55-tps-485-350.svg'
  },
  items: [
    { label: '文档', position: 'left', to: 'guides' },
    { label: 'API', position: 'left', to: 'api' },
    { label: '博客', position: 'left', to: 'web/blog' },
    {
      label: '关于',
      position: 'left',
      items: [
        { label: '常见问题', to: '/guides/faq' },
        // { label: '版本发布', to: '/changelog/1.0.0' },
        { label: '社区指南', to: '/about/community-guide' },
        {
          label: '行为规范',
          to: 'https://github.com/eleme/morjs/blob/master/CODE_OF_CONDUCT.md'
        }
      ]
    },
    { type: 'docsVersionDropdown', position: 'right' },
    {
      className: 'header-github-link',
      position: 'right',
      href: 'https://github.com/eleme/morjs'
    }
  ]
}
