module.exports = {
  style: 'dark',
  links: [
    {
      title: '文档',
      items: [
        { label: 'MorJS 配置', href: '/guides/basic/config' },
        { label: '命令行', href: '/guides/basic/cli' },
        { label: '工程 Hooks', href: '/api/engineering-hooks' }
      ],
    },
    {
      title: '帮助',
      items: [
        { label: '常见问题', href: '/guides/faq' },
        {
          label: '社区钉钉群',
          href: 'https://qr.dingtalk.com/action/joingroup?code=v1,k1,zPirp4W1FDF7tKteTDgOjgk7cMzCTt31ztWoGVMVJ7U=&_dt_no_comment=1&origin=11'
        },
        { label: 'GitHub Issue', href: 'https://github.com/eleme/morjs/issues' }
      ],
    },
    {
      title: '更多',
      items: [
        {
          label: '行为规范',
          to: 'https://github.com/eleme/morjs/blob/master/CODE_OF_CONDUCT.md'
        },
        {
          label: '参与贡献',
          href: 'https://github.com/eleme/morjs/blob/master/CONTRIBUTING.md'
        }
      ]
    }
  ],
  copyright: `Copyright © ${new Date().getFullYear()} - Present MorJS.`
}
