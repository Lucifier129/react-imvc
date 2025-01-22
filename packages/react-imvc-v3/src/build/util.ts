import path from 'path'
import fs from 'fs'
import type { EntireConfig } from '..'
import 'webpack-node-externals'
// @ts-ignore
import { readFromPackageJson } from 'webpack-node-externals/utils'

export function getPackageRelativePath(config: EntireConfig): string {
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

export function getExternals(config: EntireConfig): string[] {
  return readFromPackageJson({ fileName: getPackageRelativePath(config) })
}

export function matchExternals(
  externals: string[],
  modulePath: string
): boolean {
  for (let i = 0; i < externals.length; i++) {
    if (modulePath.startsWith(externals[i])) {
      return true
    }
  }
  return false
}
