const path = require('path')
const fs = require('fs')
const { readFromPackageJson } = require('webpack-node-externals/utils')

function getPackageRelativePath(config) {
    if (typeof config !== 'object') {
        config = {}
    }
    const cwd = process.cwd()
    if (typeof config.root !== 'string' || config.root === cwd) {
        return 'package.json'
    }
    const rootPackagePath = path.join(config.root, './package.json')
    const rootParentPackagePath = path.join(config.root, '../package.json')
    if (fs.existsSync(rootPackagePath)) {
        return path.relative(cwd, rootPackagePath)
    } else if (fs.existsSync(rootParentPackagePath)) {
        return path.relative(cwd, rootParentPackagePath)
    }
    return 'package.json'
}
exports.getPackageRelativePath = getPackageRelativePath

exports.getExternals = function (config) {
    return readFromPackageJson({ fileName: getPackageRelativePath(config) })
}

exports.matchExternals = (externals, modulePath) => {
    for (let i = 0; i < externals.length; i++) {
        if (modulePath.startsWith(externals[i])) {
            return true
        }
    }
    return false
}
