import { existsSync, readdirSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'

const PRE_RELEASE_REGEXP = /beta|alpha|rc/

function updatePackageVersions(obj) {
  for (const packageName in obj) {
    if (packageName.startsWith('@morjs/')) {
      const packageJsonPath = resolve(
        __dirname,
        `../../${packageName.replace('@morjs/', '')}`,
        'package.json'
      )

      const version = require(packageJsonPath).version

      if (!PRE_RELEASE_REGEXP.test(version)) {
        obj[packageName] = `^${version}`
      }
    }
  }
}

;(async () => {
  const templates = readdirSync(resolve(__dirname, '../templates'))

  for (const template of templates) {
    const pkgPath = join(__dirname, '../templates', template, `package.json`)
    if (!existsSync(pkgPath)) continue

    const pkg = require(pkgPath)

    pkg.devDependencies = pkg.devDependencies || {}
    pkg.dependencies = pkg.dependencies || {}

    updatePackageVersions(pkg.dependencies)
    updatePackageVersions(pkg.devDependencies)

    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  }
})()
