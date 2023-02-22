import { downloader } from '../src'

describe('__tests__/downloader.test.ts', () => {
  const URLS = [
    // file 协议测试
    { url: './example/template', type: 'file' },
    { url: '/example/template', type: 'file' },
    { url: '~/example/template', type: 'file' },
    { url: './@example/template', type: 'file' },
    { url: '/@example/template', type: 'file' },
    { url: '~/@example/template', type: 'file' },
    { url: 'file:./example/template', type: 'file' },
    { url: 'file:/example/template', type: 'file' },
    { url: 'file:~/example/template', type: 'file' },
    { url: 'file:example/template', type: 'file' },
    { url: 'file:./@example/template', type: 'file' },
    { url: 'file:/@example/template', type: 'file' },
    { url: 'file:~/@example/template', type: 'file' },
    { url: 'file:@example/template', type: 'file' },

    // link 协议测试
    { url: 'link:./example/template', type: 'link' },
    { url: 'link:/example/template', type: 'link' },
    { url: 'link:~/example/template', type: 'link' },
    { url: 'link:example/template', type: 'link' },
    { url: 'link:./@example/template', type: 'link' },
    { url: 'link:/@example/template', type: 'link' },
    { url: 'link:~/@example/template', type: 'link' },
    { url: 'link:@example/template', type: 'link' },

    // git 协议测试
    { url: 'user/repo', type: 'git' },
    { url: 'github:user/repo', type: 'git' },
    { url: 'git@github.com:user/repo', type: 'git' },
    { url: 'https://github.com/user/repo', type: 'git' },
    { url: 'http://github.com/user/repo', type: 'git' },
    { url: 'gitlab:user/repo', type: 'git' },
    { url: 'git@gitlab.com:user/repo', type: 'git' },
    { url: 'https://gitlab.com/user/repo', type: 'git' },
    { url: 'http://gitlab.com/user/repo', type: 'git' },
    { url: 'bitbucket:user/repo', type: 'git' },
    { url: 'git@bitbucket.org:user/repo', type: 'git' },
    { url: 'https://bitbucket.org/user/repo', type: 'git' },
    { url: 'http://bitbucket.org/user/repo', type: 'git' },
    { url: 'git:user/repo', type: 'git' },
    { url: 'git:github:user/repo', type: 'git' },
    { url: 'git:git@github.com:user/repo', type: 'git' },
    { url: 'git:https://github.com/user/repo', type: 'git' },
    { url: 'git:http://github.com/user/repo', type: 'git' },
    { url: 'git:gitlab:user/repo', type: 'git' },
    { url: 'git:git@gitlab.com:user/repo', type: 'git' },
    { url: 'git:https://gitlab.com/user/repo', type: 'git' },
    { url: 'git:http://gitlab.com/user/repo', type: 'git' },
    { url: 'git:bitbucket:user/repo', type: 'git' },
    { url: 'git:git@bitbucket.org:user/repo', type: 'git' },
    { url: 'git:https://bitbucket.org/user/repo', type: 'git' },
    { url: 'git:http://bitbucket.org/user/repo', type: 'git' },

    // npm 协议测试
    { url: 'name', type: 'npm' },
    { url: 'name@1', type: 'npm' },
    { url: 'name@1.1', type: 'npm' },
    { url: 'name@1.1.1', type: 'npm' },
    { url: 'name@~1', type: 'npm' },
    { url: 'name@^1', type: 'npm' },
    { url: 'name@^1.1.1-beta.0', type: 'npm' },
    { url: 'name@^1.1.1-alpha.0', type: 'npm' },
    { url: '@scope/name', type: 'npm' },
    { url: '@scope/name@1', type: 'npm' },
    { url: '@scope/name@1.1', type: 'npm' },
    { url: '@scope/name@1.1.1', type: 'npm' },
    { url: '@scope/name@~1', type: 'npm' },
    { url: '@scope/name@^1', type: 'npm' },
    { url: '@scope/name@^1.1.1-beta.0', type: 'npm' },
    { url: '@scope/name@^1.1.1-alpha.0', type: 'npm' },
    { url: 'npm:name', type: 'npm' },
    { url: 'npm:name@1', type: 'npm' },
    { url: 'npm:name@1.1', type: 'npm' },
    { url: 'npm:name@1.1.1', type: 'npm' },
    { url: 'npm:name@~1', type: 'npm' },
    { url: 'npm:name@^1', type: 'npm' },
    { url: 'npm:name@^1.1.1-beta.0', type: 'npm' },
    { url: 'npm:name@^1.1.1-alpha.0', type: 'npm' },
    { url: 'npm:@scope/name', type: 'npm' },
    { url: 'npm:@scope/name@1', type: 'npm' },
    { url: 'npm:@scope/name@1.1', type: 'npm' },
    { url: 'npm:@scope/name@1.1.1', type: 'npm' },
    { url: 'npm:@scope/name@~1', type: 'npm' },
    { url: 'npm:@scope/name@^1', type: 'npm' },
    { url: 'npm:@scope/name@^1.1.1-beta.0', type: 'npm' },
    { url: 'npm:@scope/name@^1.1.1-alpha.0', type: 'npm' },

    // tar 协议测试
    { url: 'https://web.org/somewhere/package.tar.gz', type: 'tar' },
    { url: 'http://web.org/somewhere/package.tar.gz', type: 'tar' },
    { url: 'ftp://web.org/somewhere/package.tar.gz', type: 'tar' },
    { url: 'tar:https://web.org/somewhere/package.tar.gz', type: 'tar' },
    { url: 'tar:http://web.org/somewhere/package.tar.gz', type: 'tar' },
    { url: 'tar:ftp://web.org/somewhere/package.tar.gz', type: 'tar' }
  ] as const

  for (const pair of URLS) {
    it(`autoDetectDownloaderTypeAndOptions - ${pair.url}`, () => {
      expect(
        downloader.autoDetectDownloaderTypeAndOptions(pair.url)
      ).toHaveProperty('type', pair.type)
    })
  }
})
