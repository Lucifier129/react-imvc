const path = require('path')

exports.getExternals = config => {
  var dependencies = []

  var list = [
    path.resolve('package.json'),
    path.join(__dirname, '../package.json'),
    path.join(config.root, '../package.json')
  ]

  while (list.length) {
    var item = list.shift()
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

  var map = {}
  dependencies = dependencies.filter(name => {
    if (map[name]) {
      return false
    }
    map[name] = true
    return true
  })

  return dependencies
}

exports.matchExternals = (externals, modulePath) => {
  for (let i = 0; i < externals.length; i++) {
    if (modulePath.startsWith(externals[i])) {
      return true
    }
  }
  return false
}
