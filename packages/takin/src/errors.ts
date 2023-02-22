export function makeError(name: string): typeof Error {
  return Object.defineProperty(
    class extends Error {
      constructor(message: string) {
        super(message)
        this.name = this.constructor.name
        if (typeof Error.captureStackTrace === 'function') {
          Error.captureStackTrace(this, this.constructor)
        } else {
          this.stack = new Error(message).stack
        }
      }
    } as typeof Error,
    'name',
    {
      get() {
        return name
      }
    }
  )
}

export const CliError = makeError('CliError')
export const PluginError = makeError('PluginError')
export const ConfigError = makeError('ConfigError')
export const DownloaderError = makeError('DownloaderError')
export const HookError = makeError('HookError')
export const RunnerError = makeError('RunnerError')
export const RunnerMethodsError = makeError('RunnerMethodsError')
export const GeneratorError = makeError('GeneratorError')
