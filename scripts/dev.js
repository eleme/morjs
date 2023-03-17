const path = require('path')
const execa = require('execa')
const chalk = require('chalk')
const inquirer = require('inquirer')
const blessed = require('blessed')
const contrib = require('blessed-contrib')

const {
  // clean,
  getPackagesDir,
  getTsConfig,
  getDirs,
  getPackageJson,
  parseArgvPkg
} = require('./util')

async function dev() {
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

  const packagesDirs = await getPackagesDir(packagesPath, selectedPackages)

  const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true
  })

  const maxRow = 12
  const maxCol = 12
  const grid = new contrib.grid({
    rows: maxRow,
    cols: maxCol,
    screen
  })

  let count = packagesDirs.length
  let rowSize = 0
  let colSize = 0
  let rowOffset = 0
  let colOffset = 0
  if (count <= 2) {
    colSize = maxCol
    rowSize = maxRow / count
  } else {
    if (count % 2 === 1) {
      count += 1
    }
    colSize = maxCol / 2
    rowSize = Math.round(maxRow * (count / (count / 2) / count))
  }

  for (const packageDir of packagesDirs) {
    const packageTsConfig = await getTsConfig(packageDir)
    const logger = grid.set(
      rowOffset,
      colOffset,
      rowSize,
      colSize,
      contrib.log,
      {
        label: packageDir.replace(process.cwd(), '')
      }
    )

    if (packageTsConfig.exists) {
      const tsConfig = packageTsConfig.config
      const outDir = tsConfig.compilerOptions && tsConfig.compilerOptions.outDir
      const packageJson = await getPackageJson(packageDir)
      if (outDir) {
        const cleanPath = path.resolve(packageDir, outDir)
        logger.log(chalk.cyan('清理', cleanPath))

        // dev 情况下 暂时不清理
        // await clean(cleanPath)

        logger.log(chalk.green('执行 watch', packageDir))
        if (packageJson.scripts && packageJson.scripts.dev) {
          const command = execa.command('npm run dev', { cwd: packageDir })
          command.stdout.on('data', (msg) => {
            logger.log(msg.toString())
          })
        } else {
          const command = execa.command('tsc --watch', { cwd: packageDir })
          command.stdout.on('data', (msg) => {
            logger.log(msg.toString())
          })
        }
      } else {
        logger.log(chalk.yellow('当前工程没有 outDir 配置，跳过', packageDir))
      }
    } else {
      logger.log(chalk.yellow('当前工程没有 tsconfig.json，跳过', packageDir))
    }

    rowOffset += rowSize
    if (rowOffset === maxRow) {
      rowOffset = 0
      colOffset += colSize
    }
  }

  screen.key(['escape', 'q', 'C-c'], () => {
    return process.exit(0)
  })

  screen.render()
}

dev()
