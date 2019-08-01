import path from 'path'
import { Config } from '../config'

export const getExternals: (config: Config) => string[] = config => {
  let dependencies: string[] = []

  let list: string[] = [
    path.resolve('package.json'),
    path.join(__dirname, '../package.json'),
    path.join(<string>config.root, '../package.json')
  ]

  while (true) {
    let item: string | undefined = list.shift()
    if (item === undefined) {
      break
    }

    try {
      var pkg = require(item)
      if (pkg.dependencies) {
        dependencies = dependencies.concat(Object.keys(pkg.dependencies))
      }
      if (pkg.devDependencies) {
        dependencies = dependencies.concat(Object.keys(pkg.devDependencies))
      }
    } catch (error) {
      // ignore error
    }
  }

  interface DependenceMap {
    [propName: string]: boolean
  }

  var map: DependenceMap = {}
  dependencies = dependencies.filter(name => {
    if (map[name]) {
      return false
    }
    map[name] = true
    return true
  })

  return dependencies
}

export const matchExternals: (externals: string[], modulePath: string) => boolean = (externals, modulePath) => {
  for (let i = 0; i < externals.length; i++) {
    if (modulePath.startsWith(externals[i])) {
      return true
    }
  }
  return false
}