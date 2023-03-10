const path = require('path')
const execa = require('execa')
const chalk = require('chalk')
const inquirer = require('inquirer')

const {
  clean,
  getDirs,
  getPackagesDir,
  getTsConfig,
  getPackageJson,
  parseArgvPkg
} = require('./util')

// 判断构建优先级
function buildPriority(name) {
  if (/takin/.test(name)) return 9
  if (/runtime-base/.test(name)) return 9

  if (/utils/.test(name)) return 8
  if (/api/.test(name)) return 8

  if (/core/.test(name)) return 7

  if (/runtime-/.test(name)) return 6

  if (/plugin-compiler-wechat/.test(name)) return 5
  if (/plugin-compiler-alipay/.test(name)) return 5

  if (/plugin-compiler-/.test(name)) return 4
  if (/plugin-compiler/.test(name)) return 3

  if (/plugin-/.test(name)) return 2

  if (/cli/.test(name)) return 1

  return 0
}

async function build(packageDir) {
  // 检查 ts 配置
  const { exists, config: tsConfig } = await getTsConfig(packageDir)
  const packageName = path.basename(packageDir)
  if (!exists) {
    console.log(chalk.yellow('跳过:', `${packageName} => 未配置 tsconfig.json`))
    return
  }

  // 检查输出目录
  const outDir = tsConfig.compilerOptions && tsConfig.compilerOptions.outDir
  const packageJson = await getPackageJson(packageDir)
  if (!outDir) {
    console.log(chalk.yellow('跳过:', `${packageName} => 未配置 outDir`))
    return
  }

  // 清理模块构建内容
  if (packageJson.scripts && packageJson.scripts.clean) {
    console.log(chalk.cyan('清理:', `${packageName} => 通过命令 npm run clean`))
    await execa.command('npm run clean', { cwd: packageDir })
  } else {
    const cleanPath = path.resolve(packageDir, outDir)
    console.log(chalk.cyan('清理:', `${packageName} => ${outDir} 目录`))
    await clean(cleanPath)
  }

  // 执行构建
  console.log(chalk.green('构建:', packageName))
  if (packageJson.scripts && packageJson.scripts.build) {
    await execa.command('npm run build', { cwd: packageDir })
  } else {
    await execa.command('tsc', { cwd: packageDir })
  }
}

// 构建所有或所选模块
async function buildAll() {
  const isInteractive = process.argv.includes('--interactive')
  const packagesPath = path.resolve('./packages')
  let selectedPackages

  if (isInteractive) {
    const dirs = await getDirs(packagesPath)
    const choices = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'packages',
        message: '请选择需要构建的模块',
        choices: dirs
      }
    ])
    selectedPackages = choices.packages
  } else {
    selectedPackages = parseArgvPkg()
  }

  // 按照优先级分组
  const packagesGroup = []
  const allPackages = await getPackagesDir(packagesPath, selectedPackages)
  allPackages.forEach((packageDir) => {
    const priority = buildPriority(packageDir)
    packagesGroup[priority] = packagesGroup[priority] || []
    packagesGroup[priority].push(packageDir)
  })

  // 优先级最高排最前面
  packagesGroup.reverse()

  for (const packageDirs of packagesGroup) {
    if (!packageDirs) continue

    // 压榨 CPU 性能，加快构建速度
    await Promise.all(packageDirs.map((package) => build(package)))

    // 每组之间空一行打印，区分下优先级
    console.log('')
  }
}

// 构建指定模块，并输出完成或错误信息
buildAll().then(
  () => {
    console.log(chalk.green('\n构建完成！Enjoy ~'))
    process.exit(0)
  },
  (err) => {
    console.log(chalk.red('\n构建失败！错误信息如下👇🏻'))
    console.log(`错误信息: ${err.message}`)
    console.log(`错误堆栈: ${err.stack}`)

    process.exit(1)
  }
)
