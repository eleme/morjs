const path = require('path')
const execa = require('execa')
const chalk = require('chalk')
const inquirer = require('inquirer')

const { getDirs, parseArgvPkg } = require('./util')

async function install() {
  const packagesPath = path.resolve('./packages')
  const parsedPkg = parseArgvPkg()

  const prompt = [
    {
      type: 'input',
      name: 'deps',
      message: '依赖名称',
      validate: (v) => !!v
    },
    {
      type: 'confirm',
      name: 'dev',
      message: '是否是 devDependencies ？',
      default: false
    }
  ]

  let choices
  if (parsedPkg) {
    choices = await inquirer.prompt(prompt)
    choices.packages = parsedPkg
  } else {
    const dirs = await getDirs(packagesPath)
    choices = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'packages',
        message: '请选择需要安装依赖的模块',
        choices: dirs
      },
      ...prompt
    ])
  }

  const scope = choices.packages.map((pkg) => `@morjs/${pkg}`).join(',')
  for (const dep of choices.deps.split(' ')) {
    console.log(chalk.green(`${scope} 开始安装 ${dep}...`))
    await execa.command(
      `npx lerna add ${dep} --scope ${scope} ${choices.dev ? '--dev' : ''}`
    )
  }
}

install()
