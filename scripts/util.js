const rimraf = require('rimraf')
const fs = require('fs-extra')
const path = require('path')

exports.clean = async function clean(cleanPath) {
  await new Promise((resolve) => {
    rimraf(cleanPath, function () {
      resolve()
    })
  })
}

exports.getDirs = async function getDirs(dirPath) {
  const dirs = await fs.readdir(dirPath)
  return dirs.filter((dir) =>
    fs.statSync(path.resolve(dirPath, dir)).isDirectory()
  )
}

exports.getPackagesDir = async function getPackagesDir(
  packagesPath,
  selectedPackages
) {
  let files = []
  if (selectedPackages) {
    files = selectedPackages
  } else if (process.env.PACKAGE) {
    files = process.env.PACKAGE.split(',')
  } else {
    files = await fs.readdir(packagesPath)
  }
  const dirs = files
    .map((file) => path.resolve(packagesPath, file))
    .filter((file) => fs.statSync(file).isDirectory())
  return dirs
}

exports.getTsConfig = async function getTsConfig(packageDir) {
  const tsConfigPath = path.resolve(packageDir, 'tsconfig.json')
  const isTsConfigExists = await fs.pathExists(tsConfigPath)
  if (isTsConfigExists) {
    const tsConfig = await fs.readJSON(tsConfigPath, {
      encoding: 'utf-8'
    })
    return {
      exists: true,
      config: tsConfig
    }
  }
  return {
    exists: false,
    config: null
  }
}

exports.getPackageJson = async function getPackageJson(packageDir) {
  const configPath = path.resolve(packageDir, 'package.json')
  const config = await fs.readJSON(configPath, {
    encoding: 'utf-8'
  })
  return config
}

exports.parseArgvPkg = function parseArgvPkg() {
  const argv = process.argv
  const pkg = argv.length > 2 ? argv[argv.length - 1] : ''
  if (pkg) {
    if (pkg.includes(',')) {
      return pkg.split(',')
    }
    return [pkg]
  }
}
