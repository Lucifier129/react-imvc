import path from 'path'
import { Config } from '../type'

type GetExternals = (config: Config) => string[]

export const getExternals: GetExternals = config => {
  let dependencies: string[] = []

  let list: string[] = [
    path.resolve('package.json'),
    path.join(__dirname, '../package.json'),
    path.join(config.root, '../package.json')
  ]

  while (true) {
    let item = list.shift()
    if (item === undefined) {
      break
    }

    try {
      let pkg = require(item)
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

  let map: Record<string, boolean> = {}
  dependencies = dependencies.filter(name => {
    if (map[name]) {
      return false
    }
    map[name] = true
    return true
  })

  return dependencies
}

type MatchExternals = (externals: string[], modulePath: string) => boolean

export const matchExternals: MatchExternals = (externals, modulePath) => {
  for (let i = 0; i < externals.length; i++) {
    if (modulePath.startsWith(externals[i])) {
      return true
    }
  }
  return false
}