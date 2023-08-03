import { ensureNodeFactory } from 'compatfactory'
import path from 'crosspath'
import { check } from 'reserved-words'
import resolve from 'resolve'
import { fsExtra as fs, logger } from 'takin'
import type * as TS from 'typescript'
import typescript from 'typescript'

interface VisitorContext {
  cwd: string
  onlyExports: boolean
  fileSystem: SafeReadonlyFileSystem
  resolveCache: Map<string, string | null>
  factory: TS.NodeFactory
  transformationContext: TS.TransformationContext
  typescript: typeof TS
  importAssertions: boolean
  printer?: TS.Printer
}

type BeforeSourceFileTransformer = (
  sourceFile: TS.SourceFile,
  context: VisitorContext
) => BeforeTransformerSourceFileStepResult

interface BeforeVisitorContext extends VisitorContext {
  exportsName: string | undefined
  transformSourceFile: BeforeSourceFileTransformer
  getModuleExportsForPath(path: string): ModuleExports | undefined
  addModuleExportsForPath(path: string, exports: ModuleExports): void
  markLocalAsExported(local: string): void
  markDefaultAsExported(): void
  isLocalExported(local: string): boolean
  addImport(
    declaration: TS.ImportDeclaration,
    originalModuleSpecifier: string,
    noEmit?: boolean
  ): void
  isModuleSpecifierImportedWithoutLocals(moduleSpecifier: string): boolean
  getImportDeclarationWithModuleSpecifier(
    moduleSpecifier: string
  ): TS.ImportDeclaration | undefined
  getLocalForDefaultImportFromModule(
    moduleSpecifier: string
  ): string | undefined
  hasLocalForDefaultImportFromModule(moduleSpecifier: string): boolean
  getLocalForNamespaceImportFromModule(
    moduleSpecifier: string
  ): string | undefined
  hasLocalForNamespaceImportFromModule(moduleSpecifier: string): boolean
  getLocalForNamedImportPropertyNameFromModule(
    propertyName: string,
    moduleSpecifier: string
  ): string | undefined
  hasLocalForNamedImportPropertyNameFromModule(
    propertyName: string,
    moduleSpecifier: string
  ): boolean
  addLeadingStatements(...statements: TS.Statement[]): void
  addTrailingStatements(...statements: TS.Statement[]): void
  getFreeIdentifier(candidate: string, force?: boolean): string
  ignoreIdentifier(identifier: string): boolean
  isIdentifierFree(identifier: string): boolean
  addLocal(identifier: string): void
  readonly imports: TS.ImportDeclaration[]
  readonly leadingStatements: TS.Statement[]
  readonly trailingStatements: TS.Statement[]
  readonly isDefaultExported: boolean
  readonly exportedLocals: Set<string>
}

interface BeforeTransformerSourceFileStepResult {
  sourceFile: TS.SourceFile
}

interface ExportsData {
  property: string
}

function walkThroughFillerNodes(expression, typescript: typeof TS) {
  if (
    typescript.isParenthesizedExpression(expression) ||
    typescript.isAsExpression(expression) ||
    typescript.isTypeAssertionExpression?.(expression) ||
    // typescript.isTypeAssertion?.(expression) ||
    typescript.isNonNullExpression(expression) ||
    typescript.isExpressionWithTypeArguments(expression)
  ) {
    return expression.expression
  }

  return expression
}

function isExpression(
  node: TS.Node,
  typescript: typeof TS
): node is TS.Expression {
  try {
    return (
      (
        typescript as unknown as { isExpressionNode(node: TS.Node): boolean }
      ).isExpressionNode(node) || typescript.isIdentifier(node)
    )
  } catch {
    return false
  }
}

function getExportsData(
  expression: TS.Expression,
  exportsName = 'exports',
  typescript: typeof TS
): Partial<ExportsData> | undefined {
  expression = walkThroughFillerNodes(expression, typescript)

  if (typescript.isIdentifier(expression)) {
    if (expression.text === exportsName) {
      return {}
    } else {
      return undefined
    }
  } else if (typescript.isPropertyAccessExpression(expression)) {
    const left = walkThroughFillerNodes(expression.expression, typescript)
    const right = expression.name

    if (typescript.isIdentifier(left)) {
      if (left.text === 'module' && right.text === exportsName) {
        return {}
      } else if (left.text === exportsName) {
        return {
          property: right.text
        }
      } else {
        return undefined
      }
    } else {
      const leftData = getExportsData(left, exportsName, typescript)
      if (leftData == null) {
        return undefined
      } else {
        return {
          ...leftData,
          property: right.text
        }
      }
    }
  } else if (typescript.isElementAccessExpression(expression)) {
    const left = walkThroughFillerNodes(expression.expression, typescript)
    const right = walkThroughFillerNodes(
      expression.argumentExpression,
      typescript
    )

    if (!typescript.isStringLiteralLike(right)) return undefined

    if (typescript.isIdentifier(left)) {
      if (left.text === 'module' && right.text === exportsName) {
        return {}
      } else if (left.text === exportsName) {
        return {
          property: right.text
        }
      } else {
        return undefined
      }
    } else {
      const leftData = getExportsData(left, exportsName, typescript)
      if (leftData == null) {
        return undefined
      } else {
        return {
          ...leftData,
          property: right.text
        }
      }
    }
  } else {
    return undefined
  }
}

function hasExportAssignments(
  node: TS.Node,
  exportsName: string,
  typescript: typeof TS
): boolean {
  const result = typescript.forEachChild<boolean>(node, (nextNode) => {
    if (isExpression(nextNode, typescript)) {
      if (getExportsData(nextNode, exportsName, typescript) != null) return true
    }
    if (hasExportAssignments(nextNode, exportsName, typescript)) {
      return true
    }

    return
  })

  return result != null ? result : false
}

function getBestBodyInScope({ node, context }): TS.Node | undefined {
  const { typescript, factory } = context
  if (!typescript.isSourceFile(node)) {
    return node
  }

  const [firstStatement] = node.statements
  if (!typescript.isExpressionStatement(firstStatement)) return node
  const expression = walkThroughFillerNodes(
    firstStatement.expression,
    typescript
  )

  if (!typescript.isCallExpression(expression)) return node
  const expressionExpression = walkThroughFillerNodes(
    expression.expression,
    typescript
  )
  if (!typescript.isFunctionExpression(expressionExpression)) return node
  if (expression.arguments.length < 2) return node
  let [, secondArgument] = expression.arguments
  secondArgument = walkThroughFillerNodes(secondArgument, typescript)
  if (!typescript.isFunctionExpression(secondArgument)) return node
  if (secondArgument.parameters.length < 1) return node
  const [firstBodyParameter] = secondArgument.parameters
  if (!typescript.isIdentifier(firstBodyParameter.name)) return node
  if (
    hasExportAssignments(
      secondArgument.body,
      firstBodyParameter.name.text,
      typescript
    )
  ) {
    context.exportsName = firstBodyParameter.name.text

    return factory.updateSourceFile(
      node,
      [...secondArgument.body.statements, ...node.statements.slice(1)],
      node.isDeclarationFile,
      node.referencedFiles,
      node.typeReferenceDirectives,
      node.hasNoDefaultLib,
      node.libReferenceDirectives
    )
  }

  return node
}

function isNotEmittedStatement(
  node: TS.Node,
  typescript: typeof TS
): node is TS.NotEmittedStatement {
  return node.kind === typescript.SyntaxKind.NotEmittedStatement
}

function visitVariableDeclarationList({
  node,
  childContinuation,
  context
}): TS.VisitResult<TS.Node> {
  if (context.onlyExports) {
    return childContinuation(node)
  }

  const { typescript, factory } = context
  const continuationResult = childContinuation(node)

  if (
    continuationResult == null ||
    Array.isArray(continuationResult) ||
    !typescript.isVariableDeclarationList(continuationResult)
  ) {
    return continuationResult
  }

  const remainingDeclarations = continuationResult.declarations.filter(
    (declaration) => !isNotEmittedStatement(declaration, typescript)
  )
  if (remainingDeclarations.length === 0) return continuationResult

  return factory.updateVariableDeclarationList(node, remainingDeclarations)
}

function findNodeUp<T extends TS.Node>(
  from: TS.Node,
  nodeCb: (node: TS.Node) => node is T,
  breakWhen?: (node: TS.Node) => boolean
): T | undefined
function findNodeUp<T extends TS.Node>(
  from: TS.Node,
  nodeCb: (node: TS.Node) => boolean,
  breakWhen?: (node: TS.Node) => boolean
): T | undefined
function findNodeUp<T extends TS.Node>(
  from: TS.Node,
  nodeCb: (node: TS.Node) => boolean,
  breakWhen?: (node: TS.Node) => boolean
): T | undefined {
  let current = from as TS.Node | T
  while (current.parent != null) {
    current = current.parent
    if (breakWhen != null && breakWhen(current)) return undefined
    if (nodeCb(current)) return current as T
  }
  return undefined
}

type ReadonlyFileSystem = Pick<
  typeof fs,
  'statSync' | 'lstatSync' | 'readFileSync' | 'readdirSync'
>

interface SafeReadonlyFileSystem extends ReadonlyFileSystem {
  safeStatSync: (path: string) => fs.Stats | undefined
  safeReadFileSync: (path: string) => Buffer | undefined
}

interface ResolveOptions {
  cwd: string
  id: string
  parent: string | null | undefined
  moduleDirectory?: string
  prioritizedPackageKeys?: string[]
  prioritizedExtensions?: string[]
  resolveCache: Map<string, string | null>
  fileSystem: SafeReadonlyFileSystem
}

function isExternalLibrary(p: string): boolean {
  return !p.startsWith('.') && !p.startsWith('/')
}

function computeCacheKey(
  id: string,
  parent: string | null | undefined
): string {
  return isExternalLibrary(id)
    ? id
    : `${parent == null ? '' : `${parent}->`}${id}`
}

function isRecord<T>(value: T) {
  return (
    !Array.isArray(value) &&
    typeof value === 'object' &&
    value != null &&
    !(value instanceof Date) &&
    !(value instanceof Set) &&
    !(value instanceof WeakSet) &&
    !(value instanceof Map) &&
    !(value instanceof WeakMap)
  )
}

function resolvePath({
  id,
  parent,
  cwd,
  prioritizedPackageKeys = [
    'exports',
    'es2015',
    'esm2015',
    'module',
    'jsnext:main',
    'main',
    'browser'
  ],
  prioritizedExtensions = [
    '',
    '.js',
    '.mjs',
    '.cjs',
    '.jsx',
    '.ts',
    '.mts',
    '.cts',
    '.tsx',
    '.json'
  ],
  moduleDirectory = 'node_modules',
  fileSystem,
  resolveCache
}: ResolveOptions): string | undefined {
  id = path.normalize(id)
  if (parent != null) {
    parent = path.normalize(parent)
  }

  const cacheKey = computeCacheKey(id, parent)

  const cacheResult = resolveCache.get(cacheKey)

  if (cacheResult != null) return cacheResult

  if (cacheResult == null) return

  if (!isExternalLibrary(id)) {
    const absolute = path.isAbsolute(id)
      ? path.normalize(id)
      : path.join(parent == null ? '' : path.dirname(parent), id)
    const variants = [absolute, path.join(absolute, 'index')]

    for (const variant of variants) {
      for (const ext of prioritizedExtensions) {
        const withExtension = `${variant}${ext}`
        if (fileSystem.safeStatSync(withExtension)?.isFile() ?? false) {
          // Add it to the cache
          resolveCache.set(cacheKey, withExtension)
          return withExtension
        }
      }
    }

    resolveCache.set(cacheKey, null)
    return undefined
  }

  try {
    const resolveResult = path.normalize(
      resolve.sync(id, {
        basedir: path.normalize(cwd),
        extensions: prioritizedExtensions,
        moduleDirectory: moduleDirectory,
        readFileSync: (p) => fileSystem.readFileSync(p).toString(),
        isFile: (p) => fileSystem.safeStatSync(p)?.isFile() ?? false,
        isDirectory: (p) => fileSystem.safeStatSync(p)?.isDirectory() ?? false,
        packageFilter(pkg: Record<string, any>): Record<string, string> {
          let property: string | undefined | null | void

          if (property == null) {
            const packageKeys = Object.keys(pkg)
            property = prioritizedPackageKeys.find((key) =>
              packageKeys.includes(key)
            )
          }

          if (property != null) {
            let pickedProperty = pkg[property as any]
            while (isRecord(pickedProperty)) {
              if ('import' in pickedProperty) {
                pickedProperty = (pickedProperty as any).import
              } else if ('.' in pickedProperty) {
                pickedProperty = pickedProperty['.']
              } else if ('default' in pickedProperty) {
                pickedProperty = (pickedProperty as any).default
              } else if ('require' in pickedProperty) {
                pickedProperty = (pickedProperty as any).require
              } else {
                pickedProperty = pickedProperty[Object.keys(pickedProperty)[0]]
              }
            }

            pkg.main = pickedProperty
          }
          return pkg
        }
      })
    )

    resolveCache.set(cacheKey, resolveResult)
    return resolveResult
  } catch (ex) {
    resolveCache.set(cacheKey, null)
    return undefined
  }
}

interface IsRequireCallNoMatchResult {
  match: false
}

interface IsRequireCallMatchResultWithNoResolvedModuleSpecifier {
  match: true
  moduleSpecifier: string | undefined
  transformedModuleSpecifier: string | undefined
  resolvedModuleSpecifier: undefined
  resolvedModuleSpecifierText: undefined
}

interface IsRequireCallMatchResultWithResolvedModuleSpecifier {
  match: true
  moduleSpecifier: string
  resolvedModuleSpecifier: string
  resolvedModuleSpecifierText: string
  transformedModuleSpecifier: string
}

type IsRequireCallResult =
  | IsRequireCallNoMatchResult
  | IsRequireCallMatchResultWithNoResolvedModuleSpecifier
  | IsRequireCallMatchResultWithResolvedModuleSpecifier

const BUILT_IN_MODULE = new Set([
  'assert',
  'assert/strict',
  'async_hooks',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'diagnostics_channel',
  'dns',
  'dns/promises',
  'domain',
  'events',
  'fs',
  'fs/promises',
  'http',
  'http2',
  'https',
  'inspector',
  'module',
  'net',
  'os',
  'path',
  'path/posix',
  'path/win32',
  'perf_hooks',
  'process',
  'punycode',
  'querystring',
  'readline',
  'readline/promises',
  'repl',
  'stream',
  'stream/consumers',
  'stream/promises',
  'stream/web',
  'string_decoder',
  'timers',
  'timers/promises',
  'tls',
  'trace_events',
  'tty',
  'url',
  'util',
  'util/types',
  'v8',
  'vm',
  'worker_threads',
  'zlib'
] as const)

function isBuiltInModule(moduleName) {
  return BUILT_IN_MODULE.has(moduleName)
}

function determineNewExtension(currentExtension: string): string {
  switch (currentExtension) {
    case '.ts':
    case '.tsx':
    case '.d.ts':
    case '.d.mts':
    case '.js':
    case '.jsx':
    case '.cjs':
    case '.cjsx':
    case '.cts':
      return '.js'
    case '.mjs':
    case '.mts':
    case '.mjsx':
    case '.d.cts':
      return '.mjs'
    default:
      return currentExtension
  }
}

function stripKnownExtension(file: string): string {
  let currentExtname: string | undefined

  const KNOWN_EXTENSIONS = [
    '.d.ts',
    '.d.dts.map',
    '.js.map',
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.mjs',
    '.mjs.map',
    '.mjsx',
    '.cjs',
    '.cjs.map',
    '.csjx',
    '.d.cts',
    '.d.cts.map',
    '.d.mts',
    '.d.mts.map',
    '.json',
    '.tsbuildinfo'
  ] as const

  for (const extName of KNOWN_EXTENSIONS) {
    if (file.endsWith(extName)) {
      currentExtname = extName
      break
    }
  }

  if (currentExtname == null) return file

  return file.slice(0, file.lastIndexOf(currentExtname))
}

function ensureHasLeadingDotAndPosix(p: string): string {
  const posixPath = path.normalize(p)
  if (posixPath.startsWith('.')) return posixPath
  if (posixPath.startsWith('/')) return `.${posixPath}`
  return `./${posixPath}`
}

function setExtension(file: string, extension: string): string {
  return path.normalize(`${stripKnownExtension(file)}${extension}`)
}

function transformModuleSpecifier(
  moduleSpecifier: string,
  { context, parent, resolvedModuleSpecifier }
): string {
  if (path.extname(moduleSpecifier) !== '' || resolvedModuleSpecifier == null) {
    return moduleSpecifier
  }

  switch (context.preserveModuleSpecifiers) {
    case 'always':
      return moduleSpecifier
    case 'never':
      break
    case 'external':
      if (isExternalLibrary(moduleSpecifier)) {
        return moduleSpecifier
      }
      break
    case 'internal':
      if (!isExternalLibrary(moduleSpecifier)) {
        return moduleSpecifier
      }
      break
    default:
      if (context.preserveModuleSpecifiers(moduleSpecifier)) {
        return moduleSpecifier
      }
  }

  return setExtension(
    ensureHasLeadingDotAndPosix(
      path.relative(path.dirname(parent), resolvedModuleSpecifier)
    ),
    determineNewExtension(path.extname(resolvedModuleSpecifier))
  )
}

function isRequireCall(
  inputExpression: TS.Expression,
  sourceFile: TS.SourceFile,
  context: VisitorContext
): IsRequireCallResult {
  const { typescript } = context
  const callExpression = walkThroughFillerNodes(inputExpression, typescript)
  if (!typescript.isCallExpression(callExpression)) return { match: false }

  const expression = walkThroughFillerNodes(
    callExpression.expression,
    typescript
  )
  if (!typescript.isIdentifier(expression) || expression.text !== 'require')
    return { match: false }

  // Take the first argument, if there is any
  const [firstArgument] = callExpression.arguments
  if (firstArgument == null) return { match: false }

  const moduleSpecifier = typescript.isStringLiteralLike(firstArgument)
    ? firstArgument.text
    : undefined

  const resolvedModuleSpecifier =
    moduleSpecifier == null
      ? undefined
      : resolvePath({
          ...context,
          id: moduleSpecifier,
          parent: sourceFile.fileName
        })

  const resolvedModuleSpecifierText =
    resolvedModuleSpecifier == null || isBuiltInModule(resolvedModuleSpecifier)
      ? undefined
      : context.fileSystem.safeReadFileSync(resolvedModuleSpecifier)?.toString()

  if (
    moduleSpecifier == null ||
    resolvedModuleSpecifier == null ||
    resolvedModuleSpecifierText == null
  ) {
    return {
      match: true,
      moduleSpecifier,
      transformedModuleSpecifier: moduleSpecifier,
      resolvedModuleSpecifier: undefined,
      resolvedModuleSpecifierText: undefined
    }
  } else {
    return {
      match: true,
      transformedModuleSpecifier: transformModuleSpecifier(moduleSpecifier, {
        resolvedModuleSpecifier,
        context,
        parent: sourceFile.fileName
      }),
      moduleSpecifier,
      resolvedModuleSpecifier,
      resolvedModuleSpecifierText
    }
  }
}

interface ModuleExports {
  namedExports: Set<string>
  hasDefaultExport: boolean
  assert?: string
}

function isJsonModule(p: string): boolean {
  return p.endsWith(`.json`)
}

function getModuleExportsFromRequireDataInContext(
  data: IsRequireCallResult,
  context
): ModuleExports | undefined {
  if (!data.match) return undefined

  const { typescript } = context

  const {
    moduleSpecifier,
    resolvedModuleSpecifierText,
    resolvedModuleSpecifier
  } = data

  if (moduleSpecifier == null) {
    return undefined
  }

  let moduleExports: ModuleExports | undefined

  if (resolvedModuleSpecifier == null && isBuiltInModule(moduleSpecifier)) {
    const BUILT_IN_MODULE_MAP = {
      assert: {
        namedExports: new Set([]),
        hasDefaultExport: true
      },
      'assert/strict': {
        namedExports: new Set([]),
        hasDefaultExport: true
      },
      async_hooks: {
        namedExports: new Set([
          'AsyncLocalStorage',
          'createHook',
          'executionAsyncId',
          'triggerAsyncId',
          'executionAsyncResource',
          'asyncWrapProviders',
          'AsyncResource'
        ]),
        hasDefaultExport: true
      },
      buffer: {
        namedExports: new Set([
          'Blob',
          'resolveObjectURL',
          'Buffer',
          'SlowBuffer',
          'transcode',
          'kMaxLength',
          'kStringMaxLength',
          'btoa',
          'atob',
          'constants',
          'INSPECT_MAX_BYTES'
        ]),
        hasDefaultExport: true
      },
      child_process: {
        namedExports: new Set([
          'ChildProcess',
          'exec',
          'execFile',
          'execFileSync',
          'execSync',
          'fork',
          'spawn',
          'spawnSync'
        ]),
        hasDefaultExport: true
      },
      cluster: {
        namedExports: new Set([
          'isWorker',
          'isMaster',
          'isPrimary',
          'Worker',
          'workers',
          'settings',
          'SCHED_NONE',
          'SCHED_RR',
          'schedulingPolicy',
          'setupPrimary',
          'setupMaster',
          'fork',
          'disconnect'
        ]),
        hasDefaultExport: true
      },
      console: {
        namedExports: new Set([
          'log',
          'warn',
          'dir',
          'time',
          'timeEnd',
          'timeLog',
          'trace',
          'assert',
          'clear',
          'count',
          'countReset',
          'group',
          'groupEnd',
          'table',
          'debug',
          'info',
          'dirxml',
          'error',
          'groupCollapsed',
          'Console',
          'profile',
          'profileEnd',
          'timeStamp',
          'context'
        ]),
        hasDefaultExport: true
      },
      constants: {
        namedExports: new Set([
          'E2BIG',
          'EACCES',
          'EADDRINUSE',
          'EADDRNOTAVAIL',
          'EAFNOSUPPORT',
          'EAGAIN',
          'EALREADY',
          'EBADF',
          'EBADMSG',
          'EBUSY',
          'ECANCELED',
          'ECHILD',
          'ECONNABORTED',
          'ECONNREFUSED',
          'ECONNRESET',
          'EDEADLK',
          'EDESTADDRREQ',
          'EDOM',
          'EEXIST',
          'EFAULT',
          'EFBIG',
          'EHOSTUNREACH',
          'EIDRM',
          'EILSEQ',
          'EINPROGRESS',
          'EINTR',
          'EINVAL',
          'EIO',
          'EISCONN',
          'EISDIR',
          'ELOOP',
          'EMFILE',
          'EMLINK',
          'EMSGSIZE',
          'ENAMETOOLONG',
          'ENETDOWN',
          'ENETRESET',
          'ENETUNREACH',
          'ENFILE',
          'ENOBUFS',
          'ENODATA',
          'ENODEV',
          'ENOENT',
          'ENOEXEC',
          'ENOLCK',
          'ENOLINK',
          'ENOMEM',
          'ENOMSG',
          'ENOPROTOOPT',
          'ENOSPC',
          'ENOSR',
          'ENOSTR',
          'ENOSYS',
          'ENOTCONN',
          'ENOTDIR',
          'ENOTEMPTY',
          'ENOTSOCK',
          'ENOTSUP',
          'ENOTTY',
          'ENXIO',
          'EOPNOTSUPP',
          'EOVERFLOW',
          'EPERM',
          'EPIPE',
          'EPROTO',
          'EPROTONOSUPPORT',
          'EPROTOTYPE',
          'ERANGE',
          'EROFS',
          'ESPIPE',
          'ESRCH',
          'ETIME',
          'ETIMEDOUT',
          'ETXTBSY',
          'EWOULDBLOCK',
          'EXDEV',
          'WSAEINTR',
          'WSAEBADF',
          'WSAEACCES',
          'WSAEFAULT',
          'WSAEINVAL',
          'WSAEMFILE',
          'WSAEWOULDBLOCK',
          'WSAEINPROGRESS',
          'WSAEALREADY',
          'WSAENOTSOCK',
          'WSAEDESTADDRREQ',
          'WSAEMSGSIZE',
          'WSAEPROTOTYPE',
          'WSAENOPROTOOPT',
          'WSAEPROTONOSUPPORT',
          'WSAESOCKTNOSUPPORT',
          'WSAEOPNOTSUPP',
          'WSAEPFNOSUPPORT',
          'WSAEAFNOSUPPORT',
          'WSAEADDRINUSE',
          'WSAEADDRNOTAVAIL',
          'WSAENETDOWN',
          'WSAENETUNREACH',
          'WSAENETRESET',
          'WSAECONNABORTED',
          'WSAECONNRESET',
          'WSAENOBUFS',
          'WSAEISCONN',
          'WSAENOTCONN',
          'WSAESHUTDOWN',
          'WSAETOOMANYREFS',
          'WSAETIMEDOUT',
          'WSAECONNREFUSED',
          'WSAELOOP',
          'WSAENAMETOOLONG',
          'WSAEHOSTDOWN',
          'WSAEHOSTUNREACH',
          'WSAENOTEMPTY',
          'WSAEPROCLIM',
          'WSAEUSERS',
          'WSAEDQUOT',
          'WSAESTALE',
          'WSAEREMOTE',
          'WSASYSNOTREADY',
          'WSAVERNOTSUPPORTED',
          'WSANOTINITIALISED',
          'WSAEDISCON',
          'WSAENOMORE',
          'WSAECANCELLED',
          'WSAEINVALIDPROCTABLE',
          'WSAEINVALIDPROVIDER',
          'WSAEPROVIDERFAILEDINIT',
          'WSASYSCALLFAILURE',
          'WSASERVICE_NOT_FOUND',
          'WSATYPE_NOT_FOUND',
          'WSA_E_NO_MORE',
          'WSA_E_CANCELLED',
          'WSAEREFUSED',
          'PRIORITY_LOW',
          'PRIORITY_BELOW_NORMAL',
          'PRIORITY_NORMAL',
          'PRIORITY_ABOVE_NORMAL',
          'PRIORITY_HIGH',
          'PRIORITY_HIGHEST',
          'SIGHUP',
          'SIGINT',
          'SIGILL',
          'SIGABRT',
          'SIGFPE',
          'SIGKILL',
          'SIGSEGV',
          'SIGTERM',
          'SIGBREAK',
          'SIGWINCH',
          'UV_FS_SYMLINK_DIR',
          'UV_FS_SYMLINK_JUNCTION',
          'O_RDONLY',
          'O_WRONLY',
          'O_RDWR',
          'UV_DIRENT_UNKNOWN',
          'UV_DIRENT_FILE',
          'UV_DIRENT_DIR',
          'UV_DIRENT_LINK',
          'UV_DIRENT_FIFO',
          'UV_DIRENT_SOCKET',
          'UV_DIRENT_CHAR',
          'UV_DIRENT_BLOCK',
          'S_IFMT',
          'S_IFREG',
          'S_IFDIR',
          'S_IFCHR',
          'S_IFLNK',
          'O_CREAT',
          'O_EXCL',
          'UV_FS_O_FILEMAP',
          'O_TRUNC',
          'O_APPEND',
          'S_IRUSR',
          'S_IWUSR',
          'F_OK',
          'R_OK',
          'W_OK',
          'X_OK',
          'UV_FS_COPYFILE_EXCL',
          'COPYFILE_EXCL',
          'UV_FS_COPYFILE_FICLONE',
          'COPYFILE_FICLONE',
          'UV_FS_COPYFILE_FICLONE_FORCE',
          'COPYFILE_FICLONE_FORCE',
          'OPENSSL_VERSION_NUMBER',
          'SSL_OP_ALL',
          'SSL_OP_ALLOW_NO_DHE_KEX',
          'SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION',
          'SSL_OP_CIPHER_SERVER_PREFERENCE',
          'SSL_OP_CISCO_ANYCONNECT',
          'SSL_OP_COOKIE_EXCHANGE',
          'SSL_OP_CRYPTOPRO_TLSEXT_BUG',
          'SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS',
          'SSL_OP_EPHEMERAL_RSA',
          'SSL_OP_LEGACY_SERVER_CONNECT',
          'SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER',
          'SSL_OP_MICROSOFT_SESS_ID_BUG',
          'SSL_OP_MSIE_SSLV2_RSA_PADDING',
          'SSL_OP_NETSCAPE_CA_DN_BUG',
          'SSL_OP_NETSCAPE_CHALLENGE_BUG',
          'SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG',
          'SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG',
          'SSL_OP_NO_COMPRESSION',
          'SSL_OP_NO_ENCRYPT_THEN_MAC',
          'SSL_OP_NO_QUERY_MTU',
          'SSL_OP_NO_RENEGOTIATION',
          'SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION',
          'SSL_OP_NO_SSLv2',
          'SSL_OP_NO_SSLv3',
          'SSL_OP_NO_TICKET',
          'SSL_OP_NO_TLSv1',
          'SSL_OP_NO_TLSv1_1',
          'SSL_OP_NO_TLSv1_2',
          'SSL_OP_NO_TLSv1_3',
          'SSL_OP_PKCS1_CHECK_1',
          'SSL_OP_PKCS1_CHECK_2',
          'SSL_OP_PRIORITIZE_CHACHA',
          'SSL_OP_SINGLE_DH_USE',
          'SSL_OP_SINGLE_ECDH_USE',
          'SSL_OP_SSLEAY_080_CLIENT_DH_BUG',
          'SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG',
          'SSL_OP_TLS_BLOCK_PADDING_BUG',
          'SSL_OP_TLS_D5_BUG',
          'SSL_OP_TLS_ROLLBACK_BUG',
          'ENGINE_METHOD_RSA',
          'ENGINE_METHOD_DSA',
          'ENGINE_METHOD_DH',
          'ENGINE_METHOD_RAND',
          'ENGINE_METHOD_EC',
          'ENGINE_METHOD_CIPHERS',
          'ENGINE_METHOD_DIGESTS',
          'ENGINE_METHOD_PKEY_METHS',
          'ENGINE_METHOD_PKEY_ASN1_METHS',
          'ENGINE_METHOD_ALL',
          'ENGINE_METHOD_NONE',
          'DH_CHECK_P_NOT_SAFE_PRIME',
          'DH_CHECK_P_NOT_PRIME',
          'DH_UNABLE_TO_CHECK_GENERATOR',
          'DH_NOT_SUITABLE_GENERATOR',
          'ALPN_ENABLED',
          'RSA_PKCS1_PADDING',
          'RSA_NO_PADDING',
          'RSA_PKCS1_OAEP_PADDING',
          'RSA_X931_PADDING',
          'RSA_PKCS1_PSS_PADDING',
          'RSA_PSS_SALTLEN_DIGEST',
          'RSA_PSS_SALTLEN_MAX_SIGN',
          'RSA_PSS_SALTLEN_AUTO',
          'defaultCoreCipherList',
          'TLS1_VERSION',
          'TLS1_1_VERSION',
          'TLS1_2_VERSION',
          'TLS1_3_VERSION',
          'POINT_CONVERSION_COMPRESSED',
          'POINT_CONVERSION_UNCOMPRESSED',
          'POINT_CONVERSION_HYBRID',
          'defaultCipherList'
        ]),
        hasDefaultExport: true
      },
      crypto: {
        namedExports: new Set([
          'checkPrime',
          'checkPrimeSync',
          'createCipheriv',
          'createDecipheriv',
          'createDiffieHellman',
          'createDiffieHellmanGroup',
          'createECDH',
          'createHash',
          'createHmac',
          'createPrivateKey',
          'createPublicKey',
          'createSecretKey',
          'createSign',
          'createVerify',
          'diffieHellman',
          'generatePrime',
          'generatePrimeSync',
          'getCiphers',
          'getCipherInfo',
          'getCurves',
          'getDiffieHellman',
          'getHashes',
          'hkdf',
          'hkdfSync',
          'pbkdf2',
          'pbkdf2Sync',
          'generateKeyPair',
          'generateKeyPairSync',
          'generateKey',
          'generateKeySync',
          'privateDecrypt',
          'privateEncrypt',
          'publicDecrypt',
          'publicEncrypt',
          'randomBytes',
          'randomFill',
          'randomFillSync',
          'randomInt',
          'randomUUID',
          'scrypt',
          'scryptSync',
          'sign',
          'setEngine',
          'timingSafeEqual',
          'getFips',
          'setFips',
          'verify',
          'Certificate',
          'Cipher',
          'Cipheriv',
          'Decipher',
          'Decipheriv',
          'DiffieHellman',
          'DiffieHellmanGroup',
          'ECDH',
          'Hash',
          'Hmac',
          'KeyObject',
          'Sign',
          'Verify',
          'X509Certificate',
          'secureHeapUsed',
          'constants',
          'webcrypto',
          'subtle',
          'getRandomValues'
        ]),
        hasDefaultExport: true
      },
      dgram: {
        namedExports: new Set(['createSocket', 'Socket']),
        hasDefaultExport: true
      },
      diagnostics_channel: {
        namedExports: new Set(['channel', 'hasSubscribers', 'Channel']),
        hasDefaultExport: true
      },
      dns: {
        namedExports: new Set([
          'lookup',
          'lookupService',
          'Resolver',
          'setDefaultResultOrder',
          'setServers',
          'ADDRCONFIG',
          'ALL',
          'V4MAPPED',
          'NODATA',
          'FORMERR',
          'SERVFAIL',
          'NOTFOUND',
          'NOTIMP',
          'REFUSED',
          'BADQUERY',
          'BADNAME',
          'BADFAMILY',
          'BADRESP',
          'CONNREFUSED',
          'TIMEOUT',
          'EOF',
          'FILE',
          'NOMEM',
          'DESTRUCTION',
          'BADSTR',
          'BADFLAGS',
          'NONAME',
          'BADHINTS',
          'NOTINITIALIZED',
          'LOADIPHLPAPI',
          'ADDRGETNETWORKPARAMS',
          'CANCELLED',
          'getServers',
          'resolve',
          'resolve4',
          'resolve6',
          'resolveAny',
          'resolveCaa',
          'resolveCname',
          'resolveMx',
          'resolveNaptr',
          'resolveNs',
          'resolvePtr',
          'resolveSoa',
          'resolveSrv',
          'resolveTxt',
          'reverse',
          'promises'
        ]),
        hasDefaultExport: true
      },
      'dns/promises': {
        namedExports: new Set([
          'lookup',
          'lookupService',
          'Resolver',
          'getServers',
          'resolve',
          'resolve4',
          'resolve6',
          'resolveAny',
          'resolveCaa',
          'resolveCname',
          'resolveMx',
          'resolveNaptr',
          'resolveNs',
          'resolvePtr',
          'resolveSoa',
          'resolveSrv',
          'resolveTxt',
          'reverse',
          'setServers',
          'setDefaultResultOrder'
        ]),
        hasDefaultExport: true
      },
      domain: {
        namedExports: new Set(['Domain', 'createDomain', 'create', 'active']),
        hasDefaultExport: true
      },
      events: {
        namedExports: new Set([]),
        hasDefaultExport: true
      },
      fs: {
        namedExports: new Set([
          'appendFile',
          'appendFileSync',
          'access',
          'accessSync',
          'chown',
          'chownSync',
          'chmod',
          'chmodSync',
          'close',
          'closeSync',
          'copyFile',
          'copyFileSync',
          'cp',
          'cpSync',
          'createReadStream',
          'createWriteStream',
          'exists',
          'existsSync',
          'fchown',
          'fchownSync',
          'fchmod',
          'fchmodSync',
          'fdatasync',
          'fdatasyncSync',
          'fstat',
          'fstatSync',
          'fsync',
          'fsyncSync',
          'ftruncate',
          'ftruncateSync',
          'futimes',
          'futimesSync',
          'lchown',
          'lchownSync',
          'lchmod',
          'lchmodSync',
          'link',
          'linkSync',
          'lstat',
          'lstatSync',
          'lutimes',
          'lutimesSync',
          'mkdir',
          'mkdirSync',
          'mkdtemp',
          'mkdtempSync',
          'open',
          'openSync',
          'opendir',
          'opendirSync',
          'readdir',
          'readdirSync',
          'read',
          'readSync',
          'readv',
          'readvSync',
          'readFile',
          'readFileSync',
          'readlink',
          'readlinkSync',
          'realpath',
          'realpathSync',
          'rename',
          'renameSync',
          'rm',
          'rmSync',
          'rmdir',
          'rmdirSync',
          'stat',
          'statSync',
          'symlink',
          'symlinkSync',
          'truncate',
          'truncateSync',
          'unwatchFile',
          'unlink',
          'unlinkSync',
          'utimes',
          'utimesSync',
          'watch',
          'watchFile',
          'writeFile',
          'writeFileSync',
          'write',
          'writeSync',
          'writev',
          'writevSync',
          'Dir',
          'Dirent',
          'Stats',
          'ReadStream',
          'WriteStream',
          'FileReadStream',
          'FileWriteStream',
          'F_OK',
          'R_OK',
          'W_OK',
          'X_OK',
          'constants',
          'promises'
        ]),
        hasDefaultExport: true
      },
      'fs/promises': {
        namedExports: new Set([
          'access',
          'copyFile',
          'cp',
          'open',
          'opendir',
          'rename',
          'truncate',
          'rm',
          'rmdir',
          'mkdir',
          'readdir',
          'readlink',
          'symlink',
          'lstat',
          'stat',
          'link',
          'unlink',
          'chmod',
          'lchmod',
          'lchown',
          'chown',
          'utimes',
          'lutimes',
          'realpath',
          'mkdtemp',
          'writeFile',
          'appendFile',
          'readFile',
          'watch'
        ]),
        hasDefaultExport: true
      },
      http: {
        namedExports: new Set([
          'METHODS',
          'STATUS_CODES',
          'Agent',
          'ClientRequest',
          'IncomingMessage',
          'OutgoingMessage',
          'Server',
          'ServerResponse',
          'createServer',
          'validateHeaderName',
          'validateHeaderValue',
          'get',
          'request',
          'maxHeaderSize',
          'globalAgent'
        ]),
        hasDefaultExport: true
      },
      http2: {
        namedExports: new Set([
          'connect',
          'constants',
          'createServer',
          'createSecureServer',
          'getDefaultSettings',
          'getPackedSettings',
          'getUnpackedSettings',
          'sensitiveHeaders',
          'Http2ServerRequest',
          'Http2ServerResponse'
        ]),
        hasDefaultExport: true
      },
      https: {
        namedExports: new Set([
          'Agent',
          'globalAgent',
          'Server',
          'createServer',
          'get',
          'request'
        ]),
        hasDefaultExport: true
      },
      inspector: {
        namedExports: new Set([
          'open',
          'close',
          'url',
          'waitForDebugger',
          'console',
          'Session'
        ]),
        hasDefaultExport: true
      },
      module: {
        namedExports: new Set([]),
        hasDefaultExport: true
      },
      net: {
        namedExports: new Set([
          'BlockList',
          'SocketAddress',
          'connect',
          'createConnection',
          'createServer',
          'isIP',
          'isIPv4',
          'isIPv6',
          'Server',
          'Socket',
          'Stream'
        ]),
        hasDefaultExport: true
      },
      os: {
        namedExports: new Set([
          'arch',
          'cpus',
          'endianness',
          'freemem',
          'getPriority',
          'homedir',
          'hostname',
          'loadavg',
          'networkInterfaces',
          'platform',
          'release',
          'setPriority',
          'tmpdir',
          'totalmem',
          'type',
          'userInfo',
          'uptime',
          'version',
          'constants',
          'EOL',
          'devNull'
        ]),
        hasDefaultExport: true
      },
      path: {
        namedExports: new Set([
          'resolve',
          'normalize',
          'isAbsolute',
          'join',
          'relative',
          'toNamespacedPath',
          'dirname',
          'basename',
          'extname',
          'format',
          'parse',
          'sep',
          'delimiter',
          'win32',
          'posix'
        ]),
        hasDefaultExport: true
      },
      'path/posix': {
        namedExports: new Set([
          'resolve',
          'normalize',
          'isAbsolute',
          'join',
          'relative',
          'toNamespacedPath',
          'dirname',
          'basename',
          'extname',
          'format',
          'parse',
          'sep',
          'delimiter',
          'win32',
          'posix'
        ]),
        hasDefaultExport: true
      },
      'path/win32': {
        namedExports: new Set([
          'resolve',
          'normalize',
          'isAbsolute',
          'join',
          'relative',
          'toNamespacedPath',
          'dirname',
          'basename',
          'extname',
          'format',
          'parse',
          'sep',
          'delimiter',
          'win32',
          'posix'
        ]),
        hasDefaultExport: true
      },
      perf_hooks: {
        namedExports: new Set([
          'PerformanceEntry',
          'PerformanceMark',
          'PerformanceMeasure',
          'PerformanceObserver',
          'PerformanceObserverEntryList',
          'PerformanceResourceTiming',
          'monitorEventLoopDelay',
          'createHistogram',
          'performance',
          'constants'
        ]),
        hasDefaultExport: true
      },
      process: {
        namedExports: new Set([
          'version',
          'versions',
          'arch',
          'platform',
          'release',
          'moduleLoadList',
          'binding',
          'domain',
          'config',
          'dlopen',
          'uptime',
          'getActiveResourcesInfo',
          'reallyExit',
          'cpuUsage',
          'resourceUsage',
          'memoryUsage',
          'kill',
          'exit',
          'hrtime',
          'openStdin',
          'allowedNodeEnvironmentFlags',
          'assert',
          'features',
          'setUncaughtExceptionCaptureCallback',
          'hasUncaughtExceptionCaptureCallback',
          'emitWarning',
          'nextTick',
          'stdout',
          'stdin',
          'stderr',
          'abort',
          'umask',
          'chdir',
          'cwd',
          'env',
          'title',
          'argv',
          'execArgv',
          'pid',
          'ppid',
          'execPath',
          'debugPort',
          'argv0',
          'exitCode',
          'report',
          'setSourceMapsEnabled',
          'mainModule',
          'emit'
        ]),
        hasDefaultExport: true
      },
      punycode: {
        namedExports: new Set([
          'version',
          'ucs2',
          'decode',
          'encode',
          'toASCII',
          'toUnicode'
        ]),
        hasDefaultExport: true
      },
      querystring: {
        namedExports: new Set([
          'unescapeBuffer',
          'unescape',
          'escape',
          'stringify',
          'encode',
          'parse',
          'decode'
        ]),
        hasDefaultExport: true
      },
      readline: {
        namedExports: new Set([
          'Interface',
          'clearLine',
          'clearScreenDown',
          'createInterface',
          'cursorTo',
          'emitKeypressEvents',
          'moveCursor',
          'promises'
        ]),
        hasDefaultExport: true
      },
      'readline/promises': {
        namedExports: new Set(['Interface', 'Readline', 'createInterface']),
        hasDefaultExport: true
      },
      repl: {
        namedExports: new Set([
          'start',
          'writer',
          'REPLServer',
          'REPL_MODE_SLOPPY',
          'REPL_MODE_STRICT',
          'Recoverable',
          'builtinModules'
        ]),
        hasDefaultExport: true
      },
      stream: {
        namedExports: new Set([]),
        hasDefaultExport: true
      },
      'stream/consumers': {
        namedExports: new Set([
          'arrayBuffer',
          'blob',
          'buffer',
          'text',
          'json'
        ]),
        hasDefaultExport: true
      },
      'stream/promises': {
        namedExports: new Set(['finished', 'pipeline']),
        hasDefaultExport: true
      },
      'stream/web': {
        namedExports: new Set([
          'ReadableStream',
          'ReadableStreamDefaultReader',
          'ReadableStreamBYOBReader',
          'ReadableStreamBYOBRequest',
          'ReadableByteStreamController',
          'ReadableStreamDefaultController',
          'TransformStream',
          'TransformStreamDefaultController',
          'WritableStream',
          'WritableStreamDefaultWriter',
          'WritableStreamDefaultController',
          'ByteLengthQueuingStrategy',
          'CountQueuingStrategy',
          'TextEncoderStream',
          'TextDecoderStream',
          'CompressionStream',
          'DecompressionStream'
        ]),
        hasDefaultExport: true
      },
      string_decoder: {
        namedExports: new Set(['StringDecoder']),
        hasDefaultExport: true
      },
      timers: {
        namedExports: new Set([
          'setTimeout',
          'clearTimeout',
          'setImmediate',
          'clearImmediate',
          'setInterval',
          'clearInterval',
          'active',
          'unenroll',
          'enroll'
        ]),
        hasDefaultExport: true
      },
      'timers/promises': {
        namedExports: new Set([
          'setTimeout',
          'setImmediate',
          'setInterval',
          'scheduler'
        ]),
        hasDefaultExport: true
      },
      tls: {
        namedExports: new Set([
          'CLIENT_RENEG_LIMIT',
          'CLIENT_RENEG_WINDOW',
          'DEFAULT_CIPHERS',
          'DEFAULT_ECDH_CURVE',
          'DEFAULT_MIN_VERSION',
          'DEFAULT_MAX_VERSION',
          'getCiphers',
          'rootCertificates',
          'convertALPNProtocols',
          'checkServerIdentity',
          'createSecureContext',
          'SecureContext',
          'TLSSocket',
          'Server',
          'createServer',
          'connect',
          'createSecurePair'
        ]),
        hasDefaultExport: true
      },
      trace_events: {
        namedExports: new Set(['createTracing', 'getEnabledCategories']),
        hasDefaultExport: true
      },
      tty: {
        namedExports: new Set(['isatty', 'ReadStream', 'WriteStream']),
        hasDefaultExport: true
      },
      url: {
        namedExports: new Set([
          'Url',
          'parse',
          'resolve',
          'resolveObject',
          'format',
          'URL',
          'URLSearchParams',
          'domainToASCII',
          'domainToUnicode',
          'pathToFileURL',
          'fileURLToPath',
          'urlToHttpOptions'
        ]),
        hasDefaultExport: true
      },
      util: {
        namedExports: new Set([
          'callbackify',
          'debug',
          'debuglog',
          'deprecate',
          'format',
          'formatWithOptions',
          'getSystemErrorMap',
          'getSystemErrorName',
          'inherits',
          'inspect',
          'isArray',
          'isBoolean',
          'isBuffer',
          'isDeepStrictEqual',
          'isNull',
          'isNullOrUndefined',
          'isNumber',
          'isString',
          'isSymbol',
          'isUndefined',
          'isRegExp',
          'isObject',
          'isDate',
          'isError',
          'isFunction',
          'isPrimitive',
          'log',
          'promisify',
          'stripVTControlCharacters',
          'toUSVString',
          'TextDecoder',
          'TextEncoder',
          'types'
        ]),
        hasDefaultExport: true
      },
      'util/types': {
        namedExports: new Set([
          'isExternal',
          'isDate',
          'isArgumentsObject',
          'isBigIntObject',
          'isBooleanObject',
          'isNumberObject',
          'isStringObject',
          'isSymbolObject',
          'isNativeError',
          'isRegExp',
          'isAsyncFunction',
          'isGeneratorFunction',
          'isGeneratorObject',
          'isPromise',
          'isMap',
          'isSet',
          'isMapIterator',
          'isSetIterator',
          'isWeakMap',
          'isWeakSet',
          'isArrayBuffer',
          'isDataView',
          'isSharedArrayBuffer',
          'isProxy',
          'isModuleNamespaceObject',
          'isAnyArrayBuffer',
          'isBoxedPrimitive',
          'isArrayBufferView',
          'isTypedArray',
          'isUint8Array',
          'isUint8ClampedArray',
          'isUint16Array',
          'isUint32Array',
          'isInt8Array',
          'isInt16Array',
          'isInt32Array',
          'isFloat32Array',
          'isFloat64Array',
          'isBigInt64Array',
          'isBigUint64Array',
          'isKeyObject',
          'isCryptoKey'
        ]),
        hasDefaultExport: true
      },
      v8: {
        namedExports: new Set([
          'cachedDataVersionTag',
          'getHeapSnapshot',
          'getHeapStatistics',
          'getHeapSpaceStatistics',
          'getHeapCodeStatistics',
          'setFlagsFromString',
          'Serializer',
          'Deserializer',
          'DefaultSerializer',
          'DefaultDeserializer',
          'deserialize',
          'takeCoverage',
          'stopCoverage',
          'serialize',
          'writeHeapSnapshot',
          'promiseHooks'
        ]),
        hasDefaultExport: true
      },
      vm: {
        namedExports: new Set([
          'Script',
          'createContext',
          'createScript',
          'runInContext',
          'runInNewContext',
          'runInThisContext',
          'isContext',
          'compileFunction',
          'measureMemory'
        ]),
        hasDefaultExport: true
      },
      worker_threads: {
        namedExports: new Set([
          'isMainThread',
          'MessagePort',
          'MessageChannel',
          'markAsUntransferable',
          'moveMessagePortToContext',
          'receiveMessageOnPort',
          'resourceLimits',
          'threadId',
          'SHARE_ENV',
          'Worker',
          'parentPort',
          'workerData',
          'BroadcastChannel',
          'setEnvironmentData',
          'getEnvironmentData'
        ]),
        hasDefaultExport: true
      },
      zlib: {
        namedExports: new Set([
          'Deflate',
          'Inflate',
          'Gzip',
          'Gunzip',
          'DeflateRaw',
          'InflateRaw',
          'Unzip',
          'BrotliCompress',
          'BrotliDecompress',
          'deflate',
          'deflateSync',
          'gzip',
          'gzipSync',
          'deflateRaw',
          'deflateRawSync',
          'unzip',
          'unzipSync',
          'inflate',
          'inflateSync',
          'gunzip',
          'gunzipSync',
          'inflateRaw',
          'inflateRawSync',
          'brotliCompress',
          'brotliCompressSync',
          'brotliDecompress',
          'brotliDecompressSync',
          'createDeflate',
          'createInflate',
          'createDeflateRaw',
          'createInflateRaw',
          'createGzip',
          'createGunzip',
          'createUnzip',
          'createBrotliCompress',
          'createBrotliDecompress',
          'constants',
          'codes'
        ]),
        hasDefaultExport: true
      }
    }
    moduleExports = BUILT_IN_MODULE_MAP[moduleSpecifier]
  }

  // Otherwise, if we could resolve a module, try to get the exports for it
  else if (resolvedModuleSpecifier != null) {
    // Treat JSON modules as ones with a single default export
    if (isJsonModule(resolvedModuleSpecifier)) {
      moduleExports = {
        assert: 'json',
        hasDefaultExport: true,
        namedExports: new Set()
      }
    } else {
      // Try to get the ModuleExports for the resolved module, if we know them already
      moduleExports = context.getModuleExportsForPath(resolvedModuleSpecifier)

      // If that wasn't possible, generate a new SourceFile and parse it
      if (moduleExports == null && resolvedModuleSpecifierText != null) {
        moduleExports = context.transformSourceFile(
          typescript.createSourceFile(
            resolvedModuleSpecifier,
            resolvedModuleSpecifierText,
            typescript.ScriptTarget.ESNext,
            true,
            typescript.ScriptKind.TS
          ),
          {
            ...context,
            onlyExports: true
          }
        ).exports
      }
    }
  }
  return moduleExports
}

function hasExportModifier(node: any, typescript: typeof TS): boolean {
  return (
    node.modifiers != null &&
    node.modifiers.some((m) => m.kind === typescript.SyntaxKind.ExportKeyword)
  )
}

function maybeGenerateAssertClause(
  context: VisitorContext,
  moduleSpecifier: string,
  assert?: string
) {
  if (assert == null) return undefined

  const { factory, importAssertions } = context

  if (importAssertions === false) {
    return undefined
  }

  if (!('createAssertClause' in context.typescript.factory)) {
    logger.warn(
      `The current version of TypeScript (v${context.typescript.version}) does not support Import Assertions. No Import Assertion will be added for the module with specifier '${moduleSpecifier}' in the transformed code. To remove this warning, either disable import assertions or update to TypeScript v4.5 or newer.`
    )
  }

  return (factory as any).createAssertClause(
    factory.createNodeArray([
      (factory as any).createAssertEntry(
        factory.createIdentifier('type'),
        factory.createStringLiteral(assert)
      )
    ])
  )
}

function willReassignIdentifier(
  identifier: string,
  node: TS.Node,
  typescript: typeof TS
): boolean {
  const result = typescript.forEachChild<boolean>(node, (nextNode) => {
    // If it is an assignment to the given identifier
    if (
      typescript.isBinaryExpression(nextNode) &&
      nextNode.operatorToken.kind === typescript.SyntaxKind.EqualsToken &&
      typescript.isIdentifier(nextNode.left) &&
      nextNode.left.text === identifier
    ) {
      return true
    }

    if (willReassignIdentifier(identifier, nextNode, typescript)) {
      return true
    }

    return
  })

  return result != null ? result : false
}

function visitVariableDeclaration({
  node,
  childContinuation,
  sourceFile,
  context
}): TS.VisitResult<TS.Node> {
  if (context.onlyExports || node.initializer == null) {
    return childContinuation(node)
  }

  const { typescript, factory } = context

  const initializer = walkThroughFillerNodes(node.initializer, typescript)
  const statement = findNodeUp(
    node,
    typescript.isVariableStatement,
    (n) => typescript.isBlock(n) || typescript.isSourceFile(n)
  )

  if (!typescript.isCallExpression(initializer)) {
    return childContinuation(node)
  }

  const requireData = isRequireCall(initializer, sourceFile, context)

  if (!requireData.match) {
    return childContinuation(node)
  }

  const { moduleSpecifier, transformedModuleSpecifier } = requireData

  if (moduleSpecifier == null || transformedModuleSpecifier == null) {
    return childContinuation(node)
  }

  const moduleExports = getModuleExportsFromRequireDataInContext(
    requireData,
    context
  )

  if (typescript.isIdentifier(node.name)) {
    if (
      (moduleExports == null || moduleExports.hasDefaultExport) &&
      context.hasLocalForDefaultImportFromModule(moduleSpecifier)
    ) {
      return childContinuation(node)
    } else if (
      moduleExports != null &&
      !moduleExports.hasDefaultExport &&
      context.hasLocalForNamespaceImportFromModule(moduleSpecifier)
    ) {
      return childContinuation(node)
    } else if (statement != null && hasExportModifier(statement, typescript)) {
      const moduleSpecifierExpression = factory.createStringLiteral(
        transformedModuleSpecifier
      )

      if (moduleExports == null || moduleExports.hasDefaultExport) {
        const exportClause = factory.createNamedExports([
          factory.createExportSpecifier(
            false,
            node.name.text === 'default'
              ? undefined
              : factory.createIdentifier('default'),
            factory.createIdentifier(node.name.text)
          )
        ])

        context.addTrailingStatements(
          factory.createExportDeclaration(
            undefined,
            false,
            exportClause,
            moduleSpecifierExpression
          )
        )
        return undefined
      } else if (factory.createNamespaceExport != null) {
        const exportClause = factory.createNamespaceExport(
          factory.createIdentifier(node.name.text)
        )

        context.addTrailingStatements(
          factory.createExportDeclaration(
            undefined,
            false,
            exportClause,
            moduleSpecifierExpression
          )
        )
        return undefined
      } else {
        context.addImport(
          factory.createImportDeclaration(
            undefined,
            factory.createImportClause(
              false,
              undefined,
              factory.createNamespaceImport(
                factory.createIdentifier(node.name.text)
              )
            ),
            moduleSpecifierExpression,
            maybeGenerateAssertClause(
              context,
              transformedModuleSpecifier,
              moduleExports?.assert
            )
          ),
          moduleSpecifier
        )
        const exportClause = factory.createNamedExports([
          factory.createExportSpecifier(
            false,
            undefined,
            factory.createIdentifier(node.name.text)
          )
        ])
        context.addTrailingStatements(
          factory.createExportDeclaration(undefined, false, exportClause)
        )
        return undefined
      }
    } else {
      const willReassign = willReassignIdentifier(
        node.name.text,
        sourceFile,
        typescript
      )
      const newName = willReassign
        ? context.getFreeIdentifier(node.name.text, true)
        : node.name.text

      context.addImport(
        factory.createImportDeclaration(
          undefined,
          moduleExports == null || moduleExports.hasDefaultExport
            ? factory.createImportClause(
                false,
                factory.createIdentifier(newName),
                undefined
              )
            : factory.createImportClause(
                false,
                undefined,
                factory.createNamespaceImport(factory.createIdentifier(newName))
              ),
          factory.createStringLiteral(transformedModuleSpecifier),
          maybeGenerateAssertClause(
            context,
            transformedModuleSpecifier,
            moduleExports?.assert
          )
        ),
        moduleSpecifier
      )
      if (willReassign) {
        context.addLeadingStatements(
          factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
              [
                factory.createVariableDeclaration(
                  node.name.text,
                  undefined,
                  undefined,
                  factory.createIdentifier(newName)
                )
              ],
              typescript.NodeFlags.Let
            )
          )
        )
      }
      return undefined
    }
  } else if (
    moduleExports != null &&
    typescript.isObjectBindingPattern(node.name)
  ) {
    const importSpecifiers: TS.ImportSpecifier[] = []
    for (const element of node.name.elements) {
      if (
        element.propertyName == null &&
        typescript.isIdentifier(element.name)
      ) {
        if (!moduleExports.namedExports.has(element.name.text)) {
          return childContinuation(node)
        }

        importSpecifiers.push(
          factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier(element.name.text)
          )
        )
      } else if (
        element.propertyName != null &&
        typescript.isIdentifier(element.propertyName) &&
        typescript.isIdentifier(element.name)
      ) {
        if (!moduleExports.namedExports.has(element.propertyName.text)) {
          return childContinuation(node)
        }

        importSpecifiers.push(
          factory.createImportSpecifier(
            false,
            factory.createIdentifier(element.propertyName.text),
            factory.createIdentifier(element.name.text)
          )
        )
      } else {
        return childContinuation(node)
      }
    }

    if (importSpecifiers.length > 0) {
      const importSpecifiersThatWillBeReassigned = importSpecifiers.filter(
        (importSpecifier) =>
          willReassignIdentifier(
            importSpecifier.name.text,
            sourceFile,
            typescript
          )
      )
      const otherImportSpecifiers = importSpecifiers.filter(
        (importSpecifier) =>
          !importSpecifiersThatWillBeReassigned.includes(importSpecifier)
      )

      for (const importSpecifier of importSpecifiersThatWillBeReassigned) {
        const propertyName =
          importSpecifier.propertyName ?? importSpecifier.name
        const newName = context.getFreeIdentifier(
          importSpecifier.name.text,
          true
        )

        const namedImports = factory.createNamedImports([
          factory.createImportSpecifier(
            false,
            factory.createIdentifier(propertyName.text),
            factory.createIdentifier(newName)
          )
        ])

        context.addImport(
          factory.createImportDeclaration(
            undefined,
            factory.createImportClause(false, undefined, namedImports),
            factory.createStringLiteral(transformedModuleSpecifier),
            maybeGenerateAssertClause(
              context,
              transformedModuleSpecifier,
              moduleExports?.assert
            )
          ),
          moduleSpecifier
        )

        context.addLeadingStatements(
          factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
              [
                factory.createVariableDeclaration(
                  importSpecifier.name.text,
                  undefined,
                  undefined,
                  factory.createIdentifier(newName)
                )
              ],
              typescript.NodeFlags.Let
            )
          )
        )
      }

      if (otherImportSpecifiers.length > 0) {
        context.addImport(
          factory.createImportDeclaration(
            undefined,
            factory.createImportClause(
              false,
              undefined,
              factory.createNamedImports(otherImportSpecifiers)
            ),
            factory.createStringLiteral(transformedModuleSpecifier),
            maybeGenerateAssertClause(
              context,
              transformedModuleSpecifier,
              moduleExports?.assert
            )
          ),
          moduleSpecifier
        )
      }

      return undefined
    }
  }

  return childContinuation(node)
}

function getLocalsForBindingName(
  name: TS.BindingName,
  typescript: typeof TS
): string[] {
  if (typescript.isIdentifier(name)) {
    return [name.text]
  } else if (typescript.isObjectBindingPattern(name)) {
    const locals: string[] = []
    for (const element of name.elements) {
      locals.push(...getLocalsForBindingName(element.name, typescript))
    }
    return locals
  } else {
    const locals: string[] = []
    for (const element of name.elements) {
      if (typescript.isOmittedExpression(element)) continue
      locals.push(...getLocalsForBindingName(element.name, typescript))
    }
    return locals
  }
}

function nodeContainsSuper<T extends TS.Node>(
  node: T,
  typescript: typeof TS
): boolean {
  if (node.kind === typescript.SyntaxKind.ThisKeyword) return true
  return (
    typescript.forEachChild<boolean>(node, (nextNode) =>
      nodeContainsSuper(nextNode, typescript)
    ) === true
  )
}

function addExportModifier<T extends TS.ModifiersArray>(
  modifiers: T | undefined,
  context: VisitorContext
): T extends TS.ModifiersArray ? TS.ModifiersArray : undefined {
  const { factory, typescript } = context
  if (modifiers == null) {
    modifiers = factory.createNodeArray() as T
  } else if (
    modifiers.some((m) => m.kind === typescript.SyntaxKind.ExportKeyword)
  ) {
    return modifiers as unknown as T extends TS.ModifiersArray
      ? TS.ModifiersArray
      : undefined
  }

  return factory.createNodeArray([
    factory.createModifier(typescript.SyntaxKind.ExportKeyword),
    ...modifiers.map((m) => factory.createModifier(m.kind))
  ]) as T extends TS.ModifiersArray ? TS.ModifiersArray : undefined
}

function shouldDebug(debug, sourceFile?: TS.SourceFile): boolean {
  if (debug == null) return false
  if (typeof debug === 'boolean') return debug
  if (sourceFile == null) return true
  if (typeof debug === 'string') return sourceFile.fileName === debug
  else return debug(sourceFile.fileName)
}

function isNamedDeclaration(
  node: TS.Node | TS.NamedDeclaration,
  typescript: typeof TS
): node is TS.NamedDeclaration {
  if (typescript.isPropertyAccessExpression(node)) return false
  return 'name' in node && node.name != null
}

function ensureNodeHasExportModifier<T extends TS.NamedDeclaration>(
  node,
  context
): T {
  const existingModifierKinds =
    node.modifiers == null ? [] : node.modifiers.map((m) => m.kind)
  const { typescript, factory } = context
  const declarationName = typescript.getNameOfDeclaration(node)
  if (declarationName != null && typescript.isIdentifier(declarationName)) {
    if (context.isLocalExported(declarationName.text)) {
      return node
    }

    context.markLocalAsExported(declarationName.text)
  }

  if (existingModifierKinds.includes(typescript.SyntaxKind.ExportKeyword)) {
    return node as unknown as T
  }

  const newModifiers = [
    context.factory.createModifier(typescript.SyntaxKind.ExportKeyword),
    ...existingModifierKinds.map(
      (kind) => factory.createModifier(kind) as TS.Modifier
    )
  ]

  if (typescript.isFunctionDeclaration(node)) {
    return context.factory.updateFunctionDeclaration(
      node,
      node.decorators,
      newModifiers,
      node.asteriskToken,
      node.name,
      node.typeParameters,
      node.parameters,
      node.type,
      node.body
    ) as unknown as T
  } else if (typescript.isFunctionExpression(node)) {
    return context.factory.updateFunctionExpression(
      node,
      newModifiers,
      node.asteriskToken,
      node.name,
      node.typeParameters,
      node.parameters,
      node.type,
      node.body
    ) as unknown as T
  } else if (typescript.isClassDeclaration(node)) {
    return context.factory.updateClassDeclaration(
      node,
      node.decorators,
      newModifiers,
      node.name,
      node.typeParameters,
      node.heritageClauses,
      node.members
    ) as unknown as T
  } else if (typescript.isClassExpression(node)) {
    return context.factory.updateClassExpression(
      node,
      node.decorators,
      newModifiers,
      node.name,
      node.typeParameters,
      node.heritageClauses,
      node.members
    ) as unknown as T
  } else if (typescript.isVariableStatement(node)) {
    return context.factory.updateVariableStatement(
      node,
      newModifiers,
      node.declarationList
    ) as unknown as T
  } else if (typescript.isEnumDeclaration(node)) {
    return context.factory.updateEnumDeclaration(
      node,
      node.decorators,
      newModifiers,
      node.name,
      node.members
    ) as unknown as T
  } else if (typescript.isInterfaceDeclaration(node)) {
    return context.factory.updateInterfaceDeclaration(
      node,
      node.decorators,
      newModifiers,
      node.name,
      node.typeParameters,
      node.heritageClauses,
      node.members
    ) as unknown as T
  } else if (typescript.isTypeAliasDeclaration(node)) {
    return context.factory.updateTypeAliasDeclaration(
      node,
      node.decorators,
      newModifiers,
      node.name,
      node.typeParameters,
      node.type
    ) as unknown as T
  } else if (shouldDebug(context.debug)) {
    throw new TypeError(
      `Could not handle Node of kind: ${typescript.SyntaxKind[node.kind]}`
    )
  } else {
    return node
  }
}

function visitBinaryExpression({ node, sourceFile, context, continuation }) {
  const { typescript, factory } = context
  const exportsData = getExportsData(node.left, context.exportsName, typescript)
  const right = walkThroughFillerNodes(node.right, typescript)
  if (exportsData == null) return node

  if (node.operatorToken.kind === typescript.SyntaxKind.EqualsToken) {
    const variableDeclarationParent = findNodeUp(
      node,
      typescript.isVariableDeclaration
    )
    const variableDeclarationLocal =
      variableDeclarationParent != null
        ? factory.createIdentifier(
            getLocalsForBindingName(
              (variableDeclarationParent as Record<string, any>).name,
              typescript
            )[0]
          )
        : undefined

    if (exportsData.property == null || exportsData.property === 'default') {
      if (typescript.isObjectLiteralExpression(right)) {
        if (right.properties.length === 0 || variableDeclarationLocal != null) {
          const continuationResult = continuation(node.right)

          if (
            continuationResult == null ||
            Array.isArray(continuationResult) ||
            !isExpression(continuationResult, typescript)
          ) {
            return undefined
          }

          const exportedSymbol =
            variableDeclarationLocal != null
              ? variableDeclarationLocal
              : continuationResult

          if (!context.isDefaultExported) {
            context.markDefaultAsExported()
            context.addTrailingStatements(
              factory.createExportAssignment(undefined, false, exportedSymbol)
            )
          }

          return variableDeclarationParent != null ? node.right : undefined
        }

        const statements: TS.Statement[] = []
        let moduleExportsIdentifierName: string | undefined
        const elements: TS.ObjectLiteralElementLike[] = []

        for (const property of right.properties) {
          const propertyName =
            property.name == null
              ? undefined
              : typescript.isLiteralExpression(property.name) ||
                typescript.isIdentifier(property.name) ||
                typescript.isPrivateIdentifier(property.name)
              ? property.name.text
              : typescript.isLiteralExpression(property.name.expression)
              ? property.name.expression.text
              : undefined

          if (
            propertyName == null ||
            typescript.isSetAccessorDeclaration(property) ||
            typescript.isGetAccessorDeclaration(property) ||
            context.isLocalExported(propertyName)
          ) {
            elements.push(property)
            continue
          }

          if (typescript.isShorthandPropertyAssignment(property)) {
            context.markLocalAsExported(propertyName)

            elements.push(
              factory.createShorthandPropertyAssignment(
                propertyName,
                property.objectAssignmentInitializer
              )
            )

            const namedExports = factory.createNamedExports([
              factory.createExportSpecifier(false, undefined, propertyName)
            ])
            statements.push(
              factory.createExportDeclaration(
                undefined,
                false,
                namedExports,
                undefined
              )
            )
          } else if (
            typescript.isPropertyAssignment(property) &&
            typescript.isIdentifier(property.initializer)
          ) {
            context.markLocalAsExported(propertyName)

            elements.push(
              factory.createPropertyAssignment(
                propertyName,
                factory.createIdentifier(property.initializer.text)
              )
            )

            const namedExports = factory.createNamedExports([
              propertyName === property.initializer.text
                ? factory.createExportSpecifier(false, undefined, propertyName)
                : factory.createExportSpecifier(
                    false,
                    property.initializer.text,
                    propertyName
                  )
            ])

            statements.push(
              factory.createExportDeclaration(
                undefined,
                false,
                namedExports,
                undefined
              )
            )
          } else if (
            context.isIdentifierFree(propertyName) &&
            typescript.isPropertyAssignment(property) &&
            !nodeContainsSuper(property.initializer, typescript)
          ) {
            context.addLocal(propertyName)
            elements.push(
              factory.createShorthandPropertyAssignment(propertyName)
            )

            statements.push(
              factory.createVariableStatement(
                [factory.createModifier(typescript.SyntaxKind.ExportKeyword)],
                factory.createVariableDeclarationList(
                  [
                    factory.createVariableDeclaration(
                      propertyName,
                      undefined,
                      undefined,
                      property.initializer
                    )
                  ],
                  typescript.NodeFlags.Const
                )
              )
            )
          } else if (
            context.isIdentifierFree(propertyName) &&
            typescript.isMethodDeclaration(property) &&
            typescript.isIdentifier(property.name) &&
            !nodeContainsSuper(property, typescript)
          ) {
            context.addLocal(propertyName)
            elements.push(
              factory.createShorthandPropertyAssignment(propertyName)
            )

            statements.push(
              factory.createFunctionDeclaration(
                property.decorators,
                addExportModifier(property.modifiers, context),
                property.asteriskToken,
                property.name,
                property.typeParameters,
                property.parameters,
                property.type,
                property.body
              )
            )
          } else if (context.isIdentifierFree(propertyName)) {
            context.addLocal(propertyName)
            elements.push(property)
            if (moduleExportsIdentifierName == null) {
              moduleExportsIdentifierName =
                context.getFreeIdentifier('moduleExports')
            }

            context.markLocalAsExported(propertyName)
            statements.push(
              factory.createVariableStatement(
                [factory.createModifier(typescript.SyntaxKind.ExportKeyword)],
                factory.createVariableDeclarationList(
                  [
                    factory.createVariableDeclaration(
                      propertyName,
                      undefined,
                      undefined,
                      factory.createPropertyAccessExpression(
                        factory.createIdentifier(moduleExportsIdentifierName),
                        propertyName
                      )
                    )
                  ],
                  typescript.NodeFlags.Const
                )
              )
            )
          } else {
            elements.push(property)
          }
        }

        if (moduleExportsIdentifierName != null) {
          statements.push(
            factory.createVariableStatement(
              undefined,
              factory.createVariableDeclarationList(
                [
                  factory.createVariableDeclaration(
                    moduleExportsIdentifierName,
                    undefined,
                    undefined,
                    factory.createObjectLiteralExpression(elements, true)
                  )
                ],
                typescript.NodeFlags.Const
              )
            )
          )

          if (!context.isDefaultExported) {
            statements.push(
              factory.createExportAssignment(
                undefined,
                false,
                factory.createIdentifier(moduleExportsIdentifierName)
              )
            )

            context.markDefaultAsExported()
          }
        } else if (!context.isDefaultExported) {
          const defaultExportInitializer =
            factory.createObjectLiteralExpression(elements, true)
          statements.push(
            factory.createExportAssignment(
              undefined,
              false,
              defaultExportInitializer
            )
          )
        }

        context.addTrailingStatements(...statements)
        return undefined
      } else {
        const requireData = isRequireCall(node.right, sourceFile, context)

        if (!requireData.match) {
          if (!context.isDefaultExported) {
            context.markDefaultAsExported()
            const continuationResult = continuation(node.right)
            if (
              continuationResult == null ||
              Array.isArray(continuationResult) ||
              !isExpression(continuationResult, typescript)
            ) {
              return undefined
            } else {
              const replacementNode =
                variableDeclarationParent != null
                  ? continuationResult
                  : undefined
              const exportedSymbol =
                variableDeclarationLocal != null
                  ? variableDeclarationLocal
                  : continuationResult

              context.addTrailingStatements(
                factory.createExportAssignment(undefined, false, exportedSymbol)
              )
              return replacementNode
            }
          }
          return undefined
        }

        const { transformedModuleSpecifier } = requireData

        if (transformedModuleSpecifier == null) {
          if (shouldDebug(context.debug)) {
            throw new TypeError(
              `Could not handle re-export from require() call. The module specifier wasn't statically analyzable`
            )
          } else {
            return undefined
          }
        } else {
          const moduleExports = getModuleExportsFromRequireDataInContext(
            requireData,
            context
          )
          const moduleSpecifierExpression = factory.createStringLiteral(
            transformedModuleSpecifier
          )

          if (
            !context.isDefaultExported &&
            (moduleExports == null || moduleExports.hasDefaultExport)
          ) {
            context.markDefaultAsExported()
            const namedExports = factory.createNamedExports([
              factory.createExportSpecifier(false, undefined, 'default')
            ])

            context.addTrailingStatements(
              factory.createExportDeclaration(
                undefined,
                false,
                namedExports,
                moduleSpecifierExpression
              )
            )
            return undefined
          } else {
            context.addTrailingStatements(
              factory.createExportDeclaration(
                undefined,
                false,
                undefined,
                moduleSpecifierExpression
              )
            )
            return undefined
          }
        }
      }
    } else if (variableDeclarationLocal != null) {
      const local = exportsData.property
      const continuationResult = continuation(node.right)

      if (
        continuationResult == null ||
        Array.isArray(continuationResult) ||
        (!isExpression(continuationResult, typescript) &&
          !typescript.isIdentifier(continuationResult))
      ) {
        return undefined
      }

      const namedExports = factory.createNamedExports([
        local === variableDeclarationLocal.text
          ? factory.createExportSpecifier(
              false,
              undefined,
              factory.createIdentifier(local)
            )
          : factory.createExportSpecifier(
              false,
              variableDeclarationLocal.text,
              factory.createIdentifier(local)
            )
      ])

      context.addTrailingStatements(
        factory.createExportDeclaration(undefined, false, namedExports)
      )
      return continuationResult
    } else if (typescript.isIdentifier(right)) {
      const local = exportsData.property
      if (!context.isLocalExported(local)) {
        const namedExports = factory.createNamedExports([
          local === right.text
            ? factory.createExportSpecifier(
                false,
                undefined,
                factory.createIdentifier(local)
              )
            : factory.createExportSpecifier(
                false,
                right.text,
                factory.createIdentifier(local)
              )
        ])
        context.markLocalAsExported(local)
        context.addTrailingStatements(
          factory.createExportDeclaration(undefined, false, namedExports)
        )
      }
      return undefined
    } else if (
      isNamedDeclaration(right, typescript) &&
      right.name != null &&
      typescript.isIdentifier(right.name) &&
      exportsData.property === (right.name as any).text
    ) {
      context.addTrailingStatements(
        ensureNodeHasExportModifier(right, context) as unknown as TS.Statement
      )
      return undefined
    } else {
      const continuationResult = continuation(node.right)

      if (continuationResult == null || Array.isArray(continuationResult)) {
        return undefined
      }

      if (!context.isLocalExported(exportsData.property)) {
        context.markLocalAsExported(exportsData.property)

        if (typescript.isIdentifier(continuationResult)) {
          const namedExports = factory.createNamedExports([
            continuationResult.text === exportsData.property
              ? factory.createExportSpecifier(
                  false,
                  undefined,
                  factory.createIdentifier(exportsData.property)
                )
              : factory.createExportSpecifier(
                  false,
                  factory.createIdentifier(continuationResult.text),
                  factory.createIdentifier(exportsData.property)
                )
          ])
          context.addTrailingStatements(
            factory.createExportDeclaration(
              undefined,
              false,
              namedExports,
              undefined
            )
          )
        } else {
          const freeIdentifier = context.getFreeIdentifier(exportsData.property)

          if (freeIdentifier === exportsData.property) {
            context.addTrailingStatements(
              factory.createVariableStatement(
                [factory.createModifier(typescript.SyntaxKind.ExportKeyword)],
                factory.createVariableDeclarationList(
                  [
                    factory.createVariableDeclaration(
                      exportsData.property,
                      undefined,
                      undefined,
                      continuationResult as TS.Expression
                    )
                  ],
                  typescript.NodeFlags.Const
                )
              )
            )
          } else {
            const namedExports = factory.createNamedExports([
              factory.createExportSpecifier(
                false,
                freeIdentifier,
                exportsData.property
              )
            ])

            context.addTrailingStatements(
              factory.createVariableStatement(
                undefined,
                factory.createVariableDeclarationList(
                  [
                    factory.createVariableDeclaration(
                      freeIdentifier,
                      undefined,
                      undefined,
                      continuationResult as TS.Expression
                    )
                  ],
                  typescript.NodeFlags.Const
                )
              ),
              factory.createExportDeclaration(
                undefined,
                false,
                namedExports,
                undefined
              )
            )
          }
        }
      }
      return undefined
    }
  }

  return node
}

function lowerCaseFirst(str) {
  if (str.length < 2) return str.toLowerCase()
  const head = str.slice(0, 1)
  const tail = str.slice(1)
  return `${head.toLowerCase()}${tail}`
}

function camelCase(str) {
  return lowerCaseFirst(
    str
      .replace(/[-_+]+/g, ' ')
      .replace(/[ ]{2,}/g, ' ')
      .replace(/[^\w\sa-zæøåàáäâëêéèïîíìöòóôüúùû&]/gi, '')
      .replace(/[A-Z]{2,}/g, ($1) => $1.toLowerCase())
      .replace(/ (.)/g, ($1) => $1.toUpperCase())
      .replace(/ /g, '')
  )
}

function generateNameFromModuleSpecifier(moduleSpecifier: string): string {
  const { name } = path.parse(moduleSpecifier)
  return camelCase(name)
}

function isStatement(
  node: TS.Node,
  typescript: typeof TS
): node is TS.Statement {
  return (
    typescript as unknown as {
      isStatementButNotDeclaration(node: TS.Node): boolean
    }
  ).isStatementButNotDeclaration(node)
}

function isDeclaration(
  node: TS.Node,
  typescript: typeof TS
): node is TS.Declaration {
  return (
    typescript as unknown as { isDeclaration(node: TS.Node): boolean }
  ).isDeclaration(node)
}

function isStatementOrDeclaration(
  node: TS.Node,
  typescript: typeof TS
): node is TS.Statement | TS.Declaration {
  return isStatement(node, typescript) || isDeclaration(node, typescript)
}

function visitCallExpression({
  node,
  childContinuation,
  sourceFile,
  context
}): TS.VisitResult<TS.Node> {
  if (context.onlyExports) {
    return childContinuation(node)
  }

  const requireData = isRequireCall(node, sourceFile, context)
  const { typescript, factory } = context

  if (!requireData.match) {
    return childContinuation(node)
  }

  const { moduleSpecifier, transformedModuleSpecifier } = requireData

  if (moduleSpecifier == null || transformedModuleSpecifier == null) {
    return undefined
  }

  const moduleExports = getModuleExportsFromRequireDataInContext(
    requireData,
    context
  )

  const expressionStatementParent = findNodeUp(
    node,
    typescript.isExpressionStatement,
    (currentNode) =>
      typescript.isBinaryExpression(currentNode) ||
      typescript.isCallExpression(currentNode) ||
      typescript.isNewExpression(currentNode)
  )

  if (
    moduleExports == null ||
    moduleExports.namedExports.size === 0 ||
    (expressionStatementParent != null && !moduleExports.hasDefaultExport)
  ) {
    if (expressionStatementParent != null) {
      if (!context.isModuleSpecifierImportedWithoutLocals(moduleSpecifier)) {
        context.addImport(
          factory.createImportDeclaration(
            undefined,
            undefined,
            factory.createStringLiteral(transformedModuleSpecifier),
            maybeGenerateAssertClause(
              context,
              transformedModuleSpecifier,
              moduleExports?.assert
            )
          ),
          moduleSpecifier
        )
      }

      return undefined
    } else {
      if (context.hasLocalForDefaultImportFromModule(moduleSpecifier)) {
        const local =
          context.getLocalForDefaultImportFromModule(moduleSpecifier)!
        return factory.createIdentifier(local)
      } else {
        const identifier = factory.createIdentifier(
          context.getFreeIdentifier(
            generateNameFromModuleSpecifier(moduleSpecifier)
          )
        )

        const importClause = factory.createImportClause(
          false,
          identifier,
          undefined
        )

        context.addImport(
          factory.createImportDeclaration(
            undefined,
            importClause,
            factory.createStringLiteral(transformedModuleSpecifier),
            maybeGenerateAssertClause(
              context,
              transformedModuleSpecifier,
              moduleExports?.assert
            )
          ),
          moduleSpecifier
        )

        return identifier
      }
    }
  }

  const elementOrPropertyAccessExpressionParent: any = findNodeUp<
    TS.PropertyAccessExpression | TS.ElementAccessExpression
  >(
    node,
    (child) =>
      typescript.isElementAccessExpression(child) ||
      typescript.isPropertyAccessExpression(child),
    (nextNode) => isStatementOrDeclaration(nextNode, typescript)
  )

  if (elementOrPropertyAccessExpressionParent != null) {
    let rightValue: string | undefined

    if (
      typescript.isPropertyAccessExpression(
        elementOrPropertyAccessExpressionParent
      )
    ) {
      rightValue = elementOrPropertyAccessExpressionParent.name.text
    } else {
      if (
        typescript.isStringLiteralLike(
          elementOrPropertyAccessExpressionParent.argumentExpression
        )
      ) {
        rightValue =
          elementOrPropertyAccessExpressionParent.argumentExpression.text
      }
    }

    if (rightValue != null) {
      if (!moduleExports.namedExports.has(rightValue)) {
        let identifier: TS.Identifier

        if (
          moduleExports.hasDefaultExport &&
          context.hasLocalForDefaultImportFromModule(moduleSpecifier)
        ) {
          identifier = factory.createIdentifier(
            context.getLocalForDefaultImportFromModule(moduleSpecifier)!
          )
        } else if (
          !moduleExports.hasDefaultExport &&
          context.hasLocalForNamespaceImportFromModule(moduleSpecifier)
        ) {
          identifier = factory.createIdentifier(
            context.getLocalForNamespaceImportFromModule(moduleSpecifier)!
          )
        } else {
          identifier = factory.createIdentifier(
            context.getFreeIdentifier(
              generateNameFromModuleSpecifier(moduleSpecifier)
            )
          )

          context.addImport(
            factory.createImportDeclaration(
              undefined,
              moduleExports.hasDefaultExport
                ? factory.createImportClause(false, identifier, undefined)
                : factory.createImportClause(
                    false,
                    undefined,
                    factory.createNamespaceImport(identifier)
                  ),
              factory.createStringLiteral(transformedModuleSpecifier),
              maybeGenerateAssertClause(
                context,
                transformedModuleSpecifier,
                moduleExports?.assert
              )
            ),
            moduleSpecifier
          )
        }

        const objectLiteralProperties = [
          identifier.text !== rightValue
            ? factory.createPropertyAssignment(
                rightValue,
                factory.createIdentifier(identifier.text)
              )
            : factory.createShorthandPropertyAssignment(
                factory.createIdentifier(identifier.text)
              )
        ]
        return factory.createObjectLiteralExpression(objectLiteralProperties)
      } else {
        const importBindingPropertyName = rightValue

        let importBindingName: string

        if (
          context.hasLocalForNamedImportPropertyNameFromModule(
            importBindingPropertyName,
            moduleSpecifier
          )
        ) {
          importBindingName =
            context.getLocalForNamedImportPropertyNameFromModule(
              importBindingPropertyName,
              moduleSpecifier
            )!
        } else if (
          !moduleExports.hasDefaultExport &&
          context.hasLocalForNamespaceImportFromModule(moduleSpecifier)
        ) {
          importBindingName =
            context.getLocalForNamespaceImportFromModule(moduleSpecifier)!
        } else {
          importBindingName = context.getFreeIdentifier(
            importBindingPropertyName
          )

          const namedImports = factory.createNamedImports([
            importBindingPropertyName === importBindingName
              ? factory.createImportSpecifier(
                  false,
                  undefined,
                  factory.createIdentifier(importBindingPropertyName)
                )
              : factory.createImportSpecifier(
                  false,
                  factory.createIdentifier(importBindingPropertyName),
                  factory.createIdentifier(importBindingName)
                )
          ])

          const importClause = factory.createImportClause(
            false,
            undefined,
            namedImports
          )

          context.addImport(
            factory.createImportDeclaration(
              undefined,
              importClause,
              factory.createStringLiteral(transformedModuleSpecifier),
              maybeGenerateAssertClause(
                context,
                transformedModuleSpecifier,
                moduleExports?.assert
              )
            ),
            moduleSpecifier
          )
        }

        if (expressionStatementParent == null) {
          const objectLiteralProperties = [
            importBindingName !== rightValue
              ? factory.createPropertyAssignment(
                  rightValue,
                  factory.createIdentifier(importBindingName)
                )
              : factory.createShorthandPropertyAssignment(
                  factory.createIdentifier(importBindingName)
                )
          ]
          return factory.createObjectLiteralExpression(objectLiteralProperties)
        } else {
          return undefined
        }
      }
    }
  }

  const variableDeclarationParent: any = findNodeUp(
    node,
    typescript.isVariableDeclaration,
    (nextNode) => isStatement(nextNode, typescript)
  )

  if (variableDeclarationParent != null) {
    if (typescript.isIdentifier(variableDeclarationParent.name)) {
      if (
        moduleExports.hasDefaultExport &&
        context.hasLocalForDefaultImportFromModule(moduleSpecifier)
      ) {
        const local =
          context.getLocalForDefaultImportFromModule(moduleSpecifier)!
        return factory.createIdentifier(local)
      } else if (
        !moduleExports.hasDefaultExport &&
        context.hasLocalForNamespaceImportFromModule(moduleSpecifier)
      ) {
        const local =
          context.getLocalForNamespaceImportFromModule(moduleSpecifier)!
        return factory.createIdentifier(local)
      }

      // Otherwise proceed as planned
      else {
        const identifier = factory.createIdentifier(
          context.getFreeIdentifier(
            generateNameFromModuleSpecifier(moduleSpecifier)
          )
        )
        context.addImport(
          factory.createImportDeclaration(
            undefined,
            moduleExports.hasDefaultExport
              ? factory.createImportClause(false, identifier, undefined)
              : factory.createImportClause(
                  false,
                  undefined,
                  factory.createNamespaceImport(identifier)
                ),
            factory.createStringLiteral(transformedModuleSpecifier),
            maybeGenerateAssertClause(
              context,
              transformedModuleSpecifier,
              moduleExports?.assert
            )
          ),
          moduleSpecifier
        )
        return identifier
      }
    } else if (
      typescript.isObjectBindingPattern(variableDeclarationParent.name)
    ) {
      const importSpecifiers: TS.ImportSpecifier[] = []
      const skippedImportSpecifiers: TS.ImportSpecifier[] = []

      for (const element of variableDeclarationParent.name.elements) {
        if (
          element.propertyName == null &&
          typescript.isIdentifier(element.name)
        ) {
          if (moduleExports.namedExports.has(element.name.text)) {
            if (
              context.hasLocalForNamedImportPropertyNameFromModule(
                element.name.text,
                moduleSpecifier
              )
            ) {
              const local =
                context.getLocalForNamedImportPropertyNameFromModule(
                  element.name.text,
                  moduleSpecifier
                )!
              skippedImportSpecifiers.push(
                local === element.name.text
                  ? factory.createImportSpecifier(
                      false,
                      undefined,
                      factory.createIdentifier(local)
                    )
                  : factory.createImportSpecifier(
                      false,
                      factory.createIdentifier(element.name.text),
                      factory.createIdentifier(local)
                    )
              )
            } else if (context.isIdentifierFree(element.name.text)) {
              context.addLocal(element.name.text)
              importSpecifiers.push(
                factory.createImportSpecifier(
                  false,
                  undefined,
                  factory.createIdentifier(element.name.text)
                )
              )
            } else {
              const alias = context.getFreeIdentifier(element.name.text)
              importSpecifiers.push(
                factory.createImportSpecifier(
                  false,
                  factory.createIdentifier(element.name.text),
                  factory.createIdentifier(alias)
                )
              )
            }
          }
        } else if (
          element.propertyName != null &&
          typescript.isIdentifier(element.propertyName)
        ) {
          if (context.isIdentifierFree(element.propertyName.text)) {
            context.addLocal(element.propertyName.text)
            importSpecifiers.push(
              factory.createImportSpecifier(
                false,
                undefined,
                factory.createIdentifier(element.propertyName.text)
              )
            )
          } else {
            const alias = context.getFreeIdentifier(element.propertyName.text)
            importSpecifiers.push(
              factory.createImportSpecifier(
                false,
                factory.createIdentifier(element.propertyName.text),
                factory.createIdentifier(alias)
              )
            )
          }
        }
      }

      if (
        importSpecifiers.length + skippedImportSpecifiers.length !==
        variableDeclarationParent.name.elements.length
      ) {
        if (
          moduleExports.hasDefaultExport &&
          context.hasLocalForDefaultImportFromModule(moduleSpecifier)
        ) {
          const local =
            context.getLocalForDefaultImportFromModule(moduleSpecifier)!
          return factory.createIdentifier(local)
        } else if (
          !moduleExports.hasDefaultExport &&
          context.hasLocalForNamespaceImportFromModule(moduleSpecifier)
        ) {
          const local =
            context.getLocalForNamespaceImportFromModule(moduleSpecifier)!
          return factory.createIdentifier(local)
        } else {
          const identifier = factory.createIdentifier(
            context.getFreeIdentifier(
              generateNameFromModuleSpecifier(moduleSpecifier)
            )
          )
          context.addImport(
            factory.createImportDeclaration(
              undefined,
              moduleExports.hasDefaultExport
                ? factory.createImportClause(false, identifier, undefined)
                : factory.createImportClause(
                    false,
                    undefined,
                    factory.createNamespaceImport(identifier)
                  ),
              factory.createStringLiteral(transformedModuleSpecifier),
              maybeGenerateAssertClause(
                context,
                transformedModuleSpecifier,
                moduleExports?.assert
              )
            ),
            moduleSpecifier
          )
          return identifier
        }
      } else {
        if (importSpecifiers.length > 0) {
          context.addImport(
            factory.createImportDeclaration(
              undefined,
              factory.createImportClause(
                false,
                undefined,
                factory.createNamedImports(importSpecifiers)
              ),
              factory.createStringLiteral(transformedModuleSpecifier),
              maybeGenerateAssertClause(
                context,
                transformedModuleSpecifier,
                moduleExports?.assert
              )
            ),
            moduleSpecifier
          )
        }

        const objectLiteralProperties = [
          ...importSpecifiers,
          ...skippedImportSpecifiers
        ].map((specifier) =>
          specifier.propertyName != null
            ? factory.createPropertyAssignment(
                specifier.propertyName.text,
                factory.createIdentifier(specifier.name.text)
              )
            : factory.createShorthandPropertyAssignment(
                factory.createIdentifier(specifier.name.text)
              )
        )
        return factory.createObjectLiteralExpression(objectLiteralProperties)
      }
    }
  }

  const binaryExpressionParent: any = findNodeUp(
    node,
    typescript.isBinaryExpression,
    (nextNode) => isStatement(nextNode, typescript)
  )

  if (
    binaryExpressionParent != null &&
    binaryExpressionParent.operatorToken.kind ===
      typescript.SyntaxKind.EqualsToken &&
    (typescript.isPropertyAccessExpression(
      walkThroughFillerNodes(binaryExpressionParent.left, typescript)
    ) ||
      typescript.isElementAccessExpression(
        walkThroughFillerNodes(binaryExpressionParent.left, typescript)
      ))
  ) {
    if (
      moduleExports.hasDefaultExport &&
      context.hasLocalForDefaultImportFromModule(moduleSpecifier)
    ) {
      const local = context.getLocalForDefaultImportFromModule(moduleSpecifier)!
      return factory.createIdentifier(local)
    } else if (
      !moduleExports.hasDefaultExport &&
      context.hasLocalForNamespaceImportFromModule(moduleSpecifier)
    ) {
      const local =
        context.getLocalForNamespaceImportFromModule(moduleSpecifier)!
      return factory.createIdentifier(local)
    } else {
      const identifier = factory.createIdentifier(
        context.getFreeIdentifier(
          generateNameFromModuleSpecifier(moduleSpecifier)
        )
      )
      context.addImport(
        factory.createImportDeclaration(
          undefined,
          moduleExports.hasDefaultExport
            ? factory.createImportClause(false, identifier, undefined)
            : factory.createImportClause(
                false,
                undefined,
                factory.createNamespaceImport(identifier)
              ),
          factory.createStringLiteral(transformedModuleSpecifier),
          maybeGenerateAssertClause(
            context,
            transformedModuleSpecifier,
            moduleExports?.assert
          )
        ),
        moduleSpecifier
      )
      return identifier
    }
  }

  const callExpressionParent = findNodeUp(
    node,
    typescript.isCallExpression,
    (nextNode) => isStatementOrDeclaration(nextNode, typescript)
  )

  if (callExpressionParent != null) {
    if (
      moduleExports.hasDefaultExport &&
      context.hasLocalForDefaultImportFromModule(moduleSpecifier)
    ) {
      const local = context.getLocalForDefaultImportFromModule(moduleSpecifier)!
      return factory.createIdentifier(local)
    } else if (
      !moduleExports.hasDefaultExport &&
      context.hasLocalForNamespaceImportFromModule(moduleSpecifier)
    ) {
      const local =
        context.getLocalForNamespaceImportFromModule(moduleSpecifier)!
      return factory.createIdentifier(local)
    } else {
      const identifier = factory.createIdentifier(
        context.getFreeIdentifier(
          generateNameFromModuleSpecifier(moduleSpecifier)
        )
      )
      context.addImport(
        factory.createImportDeclaration(
          undefined,
          moduleExports.hasDefaultExport
            ? factory.createImportClause(false, identifier, undefined)
            : factory.createImportClause(
                false,
                undefined,
                factory.createNamespaceImport(identifier)
              ),
          factory.createStringLiteral(transformedModuleSpecifier),
          maybeGenerateAssertClause(
            context,
            transformedModuleSpecifier,
            moduleExports?.assert
          )
        ),
        moduleSpecifier
      )
      return identifier
    }
  }

  if (shouldDebug(context.debug)) {
    throw new TypeError(`Could not handle require() call`)
  } else {
    return node
  }
}

function visitNode(options): TS.VisitResult<TS.Node> {
  const { typescript } = options.context
  const bestNode = getBestBodyInScope(options)
  if (bestNode != null && bestNode !== options.node) {
    return options.childContinuation(bestNode)
  }

  if (typescript.isVariableDeclarationList(options.node)) {
    return visitVariableDeclarationList(options)
  } else if (typescript.isVariableDeclaration(options.node)) {
    return visitVariableDeclaration(options)
  } else if (typescript.isBinaryExpression(options.node)) {
    return visitBinaryExpression(options)
  } else if (typescript.isCallExpression(options.node)) {
    return visitCallExpression(options)
  }

  return options.childContinuation(options.node)
}

function shouldSkipEmit(node, typescript: typeof TS): boolean {
  if (node == null) return true
  if (Array.isArray(node))
    return node.some((otherNode) => shouldSkipEmit(otherNode, typescript))
  if (typescript.isSourceFile(node)) return false
  if (typescript.isBlock(node)) return false
  return (
    isNotEmittedStatement(node, typescript) ||
    Boolean(
      typescript.forEachChild<boolean>(node, (nextNode) =>
        shouldSkipEmit(nextNode, typescript)
      )
    )
  )
}

function transformSourceFile(
  sourceFile: TS.SourceFile,
  context: VisitorContext
): BeforeTransformerSourceFileStepResult {
  if (
    !sourceFile.text.includes('require') &&
    !sourceFile.text.includes('exports')
  ) {
    return { sourceFile }
  }

  const { typescript, factory, transformationContext } = context

  const visitorContext = ((): BeforeVisitorContext => {
    const imports: Map<
      TS.ImportDeclaration,
      { originalModuleSpecifier: string; noEmit: boolean }
    > = new Map()
    const leadingStatements: TS.Statement[] = []
    const trailingStatements: TS.Statement[] = []
    const moduleExportsMap: Map<string, ModuleExports> = new Map()
    const localsMap = (sourceFile as { locals?: Map<string, symbol> }).locals
    const locals = localsMap == null ? new Set() : new Set(localsMap.keys())
    const exportedLocals = new Set<string>()
    let isDefaultExported = false

    const addImport = (
      declaration: TS.ImportDeclaration,
      originalModuleSpecifier: string,
      noEmit = false
    ): void => {
      imports.set(declaration, { originalModuleSpecifier, noEmit })
    }

    const markLocalAsExported = (local: string): void => {
      exportedLocals.add(local)
    }

    const isLocalExported = (local: string): boolean =>
      exportedLocals.has(local)

    const markDefaultAsExported = (): void => {
      isDefaultExported = true
    }

    const addLocal = (local: string): void => {
      locals.add(local)
    }

    const getImportDeclarationWithModuleSpecifier = (
      moduleSpecifier: string
    ): TS.ImportDeclaration | undefined =>
      [...imports.entries()].find(
        ([, { originalModuleSpecifier }]) =>
          originalModuleSpecifier === moduleSpecifier
      )?.[0]

    const isModuleSpecifierImportedWithoutLocals = (
      moduleSpecifier: string
    ): boolean => {
      const matchingDeclaration =
        getImportDeclarationWithModuleSpecifier(moduleSpecifier)
      if (matchingDeclaration == null) return false
      return (
        matchingDeclaration.importClause == null ||
        (matchingDeclaration.importClause.name == null &&
          matchingDeclaration.importClause.namedBindings == null)
      )
    }

    const getLocalForDefaultImportFromModule = (
      moduleSpecifier: string
    ): string | undefined => {
      const matchingDeclaration =
        getImportDeclarationWithModuleSpecifier(moduleSpecifier)
      if (matchingDeclaration == null) return undefined
      if (
        matchingDeclaration.importClause == null ||
        matchingDeclaration.importClause.name == null
      )
        return undefined
      return matchingDeclaration.importClause.name.text
    }

    const hasLocalForDefaultImportFromModule = (
      moduleSpecifier: string
    ): boolean => getLocalForDefaultImportFromModule(moduleSpecifier) != null

    const getLocalForNamespaceImportFromModule = (
      moduleSpecifier: string
    ): string | undefined => {
      const matchingDeclaration =
        getImportDeclarationWithModuleSpecifier(moduleSpecifier)
      if (matchingDeclaration == null) {
        return undefined
      }
      if (
        matchingDeclaration.importClause == null ||
        matchingDeclaration.importClause.namedBindings == null ||
        !typescript.isNamespaceImport(
          matchingDeclaration.importClause.namedBindings
        )
      ) {
        return undefined
      }
      return matchingDeclaration.importClause.namedBindings.name.text
    }

    const hasLocalForNamespaceImportFromModule = (
      moduleSpecifier: string
    ): boolean => getLocalForNamespaceImportFromModule(moduleSpecifier) != null

    const getLocalForNamedImportPropertyNameFromModule = (
      propertyName: string,
      moduleSpecifier: string
    ): string | undefined => {
      const matchingDeclaration =
        getImportDeclarationWithModuleSpecifier(moduleSpecifier)
      if (matchingDeclaration == null) return undefined
      if (
        matchingDeclaration.importClause == null ||
        matchingDeclaration.importClause.namedBindings == null ||
        !typescript.isNamedImports(
          matchingDeclaration.importClause.namedBindings
        )
      ) {
        return undefined
      }
      for (const element of matchingDeclaration.importClause.namedBindings
        .elements) {
        if (
          element.propertyName != null &&
          element.propertyName.text === propertyName
        )
          return element.name.text
        else if (
          element.propertyName == null &&
          element.name.text === propertyName
        )
          return element.name.text
      }
      return undefined
    }

    const hasLocalForNamedImportPropertyNameFromModule = (
      propertyName: string,
      moduleSpecifier: string
    ): boolean =>
      getLocalForNamedImportPropertyNameFromModule(
        propertyName,
        moduleSpecifier
      ) != null

    const addTrailingStatements = (...statements: TS.Statement[]): void => {
      trailingStatements.push(...statements)
    }

    const addLeadingStatements = (...statements: TS.Statement[]): void => {
      leadingStatements.push(...statements)
    }

    const isIdentifierFree = (identifier: string): boolean =>
      !locals.has(identifier) &&
      !check(identifier, 'es3', true) &&
      !check(identifier, 'es5', true) &&
      !check(identifier, 'es2015', true)

    const ignoreIdentifier = (identifier: string): boolean =>
      locals.delete(identifier)

    const getFreeIdentifier = (candidate: string, force = false): string => {
      const suffix = '$'
      let counter = 0

      if (isIdentifierFree(candidate) && !force) {
        addLocal(candidate)
        return candidate
      }

      const currentCandidate = candidate + suffix + counter
      if (!isIdentifierFree(currentCandidate)) {
        counter++
      } else {
        addLocal(currentCandidate)
        return currentCandidate
      }
    }

    return {
      ...context,
      transformSourceFile,
      exportsName: undefined,
      addImport,
      addLocal,
      markLocalAsExported,
      markDefaultAsExported,
      isLocalExported,
      isModuleSpecifierImportedWithoutLocals,
      getImportDeclarationWithModuleSpecifier,
      getLocalForDefaultImportFromModule,
      hasLocalForDefaultImportFromModule,
      getLocalForNamespaceImportFromModule,
      hasLocalForNamespaceImportFromModule,
      getLocalForNamedImportPropertyNameFromModule,
      hasLocalForNamedImportPropertyNameFromModule,
      addLeadingStatements,
      addTrailingStatements,
      isIdentifierFree,
      getFreeIdentifier,
      ignoreIdentifier,
      getModuleExportsForPath: (p) => moduleExportsMap.get(path.normalize(p)),
      addModuleExportsForPath: (p, exports) =>
        moduleExportsMap.set(path.normalize(p), exports),
      get imports() {
        return [...imports.entries()]
          .filter(([, { noEmit }]) => !noEmit)
          .map(([declaration]) => declaration)
      },
      get leadingStatements() {
        return leadingStatements
      },
      get trailingStatements() {
        return trailingStatements
      },
      get isDefaultExported() {
        return isDefaultExported
      },
      get exportedLocals() {
        return exportedLocals
      }
    }
  })()

  const visitorBaseOptions = {
    context: visitorContext,

    continuation: (node) =>
      visitNode({
        ...visitorBaseOptions,
        sourceFile,
        node
      }),
    childContinuation: (node) =>
      typescript.visitEachChild(
        node,
        (cbNode) => {
          const visitResult = visitNode({
            ...visitorBaseOptions,
            sourceFile,
            node: cbNode
          })
          if (shouldSkipEmit(visitResult, typescript)) {
            return factory.createNotEmittedStatement(cbNode)
          }
          return visitResult
        },
        transformationContext
      )
  }

  let updatedSourceFile = visitNode({
    ...visitorBaseOptions,
    sourceFile,
    node: sourceFile
  }) as TS.SourceFile

  const allImports: TS.Statement[] = [
    ...visitorContext.imports,
    ...visitorContext.leadingStatements.filter(typescript.isImportDeclaration),
    ...updatedSourceFile.statements.filter(typescript.isImportDeclaration),
    ...visitorContext.trailingStatements.filter(typescript.isImportDeclaration)
  ]

  const allExports: TS.Statement[] = [
    ...visitorContext.leadingStatements.filter(
      (statement) =>
        typescript.isExportDeclaration(statement) ||
        typescript.isExportAssignment(statement)
    ),
    ...updatedSourceFile.statements.filter(
      (statement) =>
        typescript.isExportDeclaration(statement) ||
        typescript.isExportAssignment(statement)
    ),
    ...visitorContext.trailingStatements.filter(
      (statement) =>
        typescript.isExportDeclaration(statement) ||
        typescript.isExportAssignment(statement)
    )
  ]

  const allOtherStatements = [
    ...visitorContext.leadingStatements.filter(
      (statement) =>
        !allImports.includes(statement) && !allExports.includes(statement)
    ),
    ...updatedSourceFile.statements.filter(
      (statement) =>
        !allImports.includes(statement) &&
        !allExports.includes(statement) &&
        statement.kind !== typescript.SyntaxKind.NotEmittedStatement
    ),
    ...visitorContext.trailingStatements.filter(
      (statement) =>
        !allImports.includes(statement) && !allExports.includes(statement)
    )
  ]

  updatedSourceFile = factory.updateSourceFile(
    updatedSourceFile,
    [...allImports, ...allOtherStatements, ...allExports],
    sourceFile.isDeclarationFile,
    sourceFile.referencedFiles,
    sourceFile.typeReferenceDirectives,
    sourceFile.hasNoDefaultLib,
    sourceFile.libReferenceDirectives
  )

  return {
    sourceFile: updatedSourceFile
  }
}

function createSafeFileSystem(
  fileSystem: ReadonlyFileSystem
): SafeReadonlyFileSystem {
  return {
    ...fileSystem,

    safeReadFileSync: (path) => {
      try {
        return fileSystem.readFileSync(path)
      } catch {
        return undefined
      }
    },
    safeStatSync: (path) => {
      try {
        return fileSystem.statSync(path)
      } catch {
        return undefined
      }
    }
  }
}

export function cjsToEsmTransformer(): TS.TransformerFactory<TS.SourceFile> {
  return (context) => {
    const visitorContext: VisitorContext = {
      cwd: process.cwd(),
      onlyExports: false,
      fileSystem: createSafeFileSystem({
        statSync: fs.statSync,
        lstatSync: fs.lstatSync,
        readdirSync: fs.readdirSync,
        readFileSync: fs.readFileSync
      }),
      resolveCache: new Map(),
      factory: ensureNodeFactory(context.factory ?? typescript),
      transformationContext: context,
      typescript,
      importAssertions: true,
      printer: typescript.createPrinter()
    }

    return (sourceFile) =>
      transformSourceFile(sourceFile, visitorContext).sourceFile
  }
}
