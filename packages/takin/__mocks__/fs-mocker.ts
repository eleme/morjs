const path = require('path')

module.exports = function fsMocker(fs: any) {
  let _mockFiles: Record<string, string> = Object.create(null)
  let _tree: { [path: string]: string[] } = Object.create(null)

  fs._setMockFiles = (mockFiles: Record<string, string>) => {
    _mockFiles = mockFiles
    _tree = Object.create(null)

    for (const file in mockFiles) {
      const dir = path.dirname(file)

      if (!_tree[dir]) {
        _tree[dir] = []
      }

      _tree[dir].push(path.basename(file))
    }
  }

  fs.readFile = (filePath: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(fs.readFileSync(filePath))
      }, 0)
    })
  }

  fs.readFileSync = (filePath: string) => {
    return _mockFiles[filePath] || undefined
  }

  fs.pathExistsSync = (filePath: string) => {
    return filePath in _mockFiles
  }

  fs.pathExists = (filePath: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(filePath in _mockFiles)
      }, 0)
    })
  }

  fs.statSync = (filePath: string) => {
    if (!(filePath in _mockFiles)) {
      throw Error()
    }

    const isFile = !!path.extname(filePath)
    return {
      isDirectory() {
        return !isFile
      },
      isFile() {
        return isFile
      }
    }
  }

  fs.readdirSync = (dirPath: string) => {
    return _tree[dirPath]
  }

  fs.ensureDirSync = (dirPath: string) => {
    if (!_tree[dirPath]) {
      _tree[dirPath] = []
    }
  }

  fs.emptyDirSync = (dirPath: string) => {
    delete _tree[dirPath]
  }

  fs.writeFileSync = (filePath: string, content: string) => {
    const dir = path.dirname(filePath)
    if (!_tree[dir]) {
      _tree[dir] = []
    }
    _tree[dir].push(path.basename(filePath))
    _mockFiles[filePath] = content
  }

  fs.outputFile = (filePath: string, content: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(fs.writeFileSync(filePath, content))
      }, 0)
    })
  }

  fs.unlinkSync = (filePath: string) => {
    delete _mockFiles[filePath]
  }

  return fs
}
