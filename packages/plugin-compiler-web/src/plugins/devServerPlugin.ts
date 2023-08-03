import {
  COLORS,
  generateQrcodeForTerminal,
  logger,
  Plugin,
  prompts,
  Runner,
  WebpackDevServer,
  WebpackWrapper
} from '@morjs/utils'
import net from 'net'
import os from 'os'
import { WebCompilerUserConfig } from '../constants'

const DEFAULT_PORT = 8080
const DEFAULT_HOST = '0.0.0.0'

/**
 * 尝试获取可用的端口号，最多重复获取 3 次
 * @param port - 端口号
 * @param host - ip 地址
 * @param retryTimes - 当前重试次数
 * @returns 可用的端口号
 */
async function checkPortInUseAndReturnAvaliable(
  port: number | string,
  host: string,
  retryTimes: number = 0
): Promise<number> {
  const server = net.createServer()

  const availablePort = typeof port === 'string' ? parseInt(port) : port
  const res: number = await new Promise(function (resolve) {
    server.once('error', function (err) {
      if ((err as Error & { code?: string }).code === 'EADDRINUSE') {
        logger.debug(`当前端口 ${availablePort} 已被占用`)
        resolve(0)
      }
    })

    server.once('listening', function () {
      server.close(function (err) {
        if (err) {
          logger.debug(`关闭 net server 失败，原因:`, err)
          resolve(0)
        } else {
          resolve(availablePort)
        }
      })
    })

    server.listen(availablePort, host)
  })

  // 重试 3 次
  if (!res && retryTimes < 3) {
    return checkPortInUseAndReturnAvaliable(
      availablePort + 1,
      host,
      retryTimes + 1
    )
  } else {
    return availablePort
  }
}

/**
 * dev 服务器支持插件
 */
export class DevServerPlugin implements Plugin {
  name = 'MorWebDevServerPlugin'
  constructor(public wrapper: WebpackWrapper) {}
  async apply(runner: Runner<any>) {
    await this.setupDevServer(runner, this.wrapper, runner.userConfig)
  }

  /**
   * 配置 dev server
   */
  async setupDevServer(
    runner: Runner,
    wrapper: WebpackWrapper,
    userConfig: WebCompilerUserConfig
  ) {
    const { srcPaths = [], web } = userConfig as {
      outputPath: string[]
      srcPaths: string[]
      ignore: string[]
    } & WebCompilerUserConfig
    const { devServer = {} } = web || {}
    const host = devServer.host || runner.config.env.get('HOST') || DEFAULT_HOST
    let port = devServer.port || runner.config.env.get('PORT') || DEFAULT_PORT
    // 获取可用 port
    const availablePort = await checkPortInUseAndReturnAvaliable(port, host)
    if (String(availablePort) !== String(port)) {
      const answers = await prompts(
        [
          {
            type: 'select',
            name: 'suggestedPortAccepted',
            message: `端口 ${port} 已被占用，使用 ${availablePort} 端口启动？`,
            choices: [
              { title: '是', value: true },
              { title: '否', value: false }
            ]
          }
        ],
        {
          onCancel() {
            process.exit(0)
          }
        }
      )

      if (answers.suggestedPortAccepted) {
        port = availablePort
      }
    }

    // 启动 dev server
    wrapper.on('watch', () => {
      const devServerConfig = {
        port,
        host,
        historyApiFallback: true,
        static: srcPaths,
        hot: true,
        open: false,
        allowedHosts: 'all',
        devMiddleware: { stats: false },
        ...(web.devServer || {})
      }

      // 定制 logger
      wrapper.compiler.hooks.infrastructureLog.tap(
        this.name,
        function (name, type, args) {
          if (name === 'webpack-dev-server') {
            const [msgOrError, ...restArgs] = args || []
            if (type === 'error' && msgOrError instanceof Error) {
              const msg = msgOrError.message || msgOrError.name || '未知错误'
              const error = msgOrError
              logger.error(msg, { error })
            } else {
              logger.debug(msgOrError, ...restArgs)
            }
          }
          return true
        }
      )

      let devServer = new WebpackDevServer(devServerConfig, wrapper.compiler)

      // 输出服务链接
      let lastPrintTime: number = 0
      wrapper.compiler.hooks.done.tapPromise(this.name, async () => {
        if (!devServer) return

        // 2 分钟最多打印一次
        if (Date.now() - lastPrintTime < 2 * 60 * 1000) return
        const ip = this.getIpAddress(devServer?.options?.host)

        const scheme =
          (devServer?.options?.server as Record<string, string>)?.type ===
          'http'
            ? 'http'
            : 'https'

        const url = `${scheme}://${ip}:${devServerConfig.port}`
        const qrcode = await generateQrcodeForTerminal(url)

        logger.info(
          `浏览器中打开链接: ${COLORS.info(
            url
          )}\n或通过手机扫描下方二维码预览 👇\n\n` +
            qrcode +
            '\n'
        )

        lastPrintTime = Date.now()
      })

      devServer.start()

      // runner 关闭时自动关闭 server
      runner.hooks.shutdown.tapPromise(this.name, async function () {
        if (devServer) await devServer.stop()
        devServer = null
      })
    })
  }

  /**
   * 获取本机 ip
   */
  getIpAddress(host: string = DEFAULT_HOST): string {
    if (host !== DEFAULT_HOST) return host

    const interfaces = os.networkInterfaces()
    for (const devName in interfaces) {
      const iFace = interfaces[devName]
      for (let i = 0; i < iFace.length; i++) {
        const alias = iFace[i]
        if (
          alias.family === 'IPv4' &&
          alias.address !== '127.0.0.1' &&
          !alias.internal
        ) {
          return alias.address
        }
      }
    }

    return '127.0.0.1'
  }
}
