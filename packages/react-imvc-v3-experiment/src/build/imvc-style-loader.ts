import path from 'path'
import * as webpack from 'webpack'
import fileLoader from 'file-loader'
import { RawSource } from 'webpack-sources'

const controllerScriptRegexp =
  /(\\|\/)(controller|Controller)\.(tsx|ts|js|jsx)$/
const controllerStyleRegexp = /(\\|\/)(controller|Controller)\.(scss|sass|css)$/
const styleRegexp = /\.(scss|sass|css)$/

type GetStyleFilenameFn = (content: string) => string

type StyleInfo = {
  filename: string
  content: string
  getFilename: GetStyleFilenameFn
}

type CompilerStyleInfoWeakMap = WeakMap<
  webpack.Compiler,
  Map<string, StyleInfo>
>

const compilerStyleInfoWeakMap: CompilerStyleInfoWeakMap = new WeakMap()

const setStyleInfo = (
  compiler: webpack.Compiler,
  resourcePath: string,
  styleInfo: StyleInfo
) => {
  if (!compilerStyleInfoWeakMap.has(compiler)) {
    compilerStyleInfoWeakMap.set(compiler, new Map())
  }

  const map = compilerStyleInfoWeakMap.get(compiler) as Map<string, StyleInfo>

  map.set(resourcePath, styleInfo)
}

const assetStyleInfo = (
  compiler: webpack.Compiler,
  resourcePath: string
): StyleInfo => {
  if (!compilerStyleInfoWeakMap.has(compiler)) {
    throw new Error(`style info weakmap not found for ${resourcePath}`)
  }

  const map = compilerStyleInfoWeakMap.get(compiler) as Map<string, StyleInfo>

  if (!map.has(resourcePath)) {
    throw new Error(`style info not found for ${resourcePath}`)
  }

  return map.get(resourcePath) as StyleInfo
}

const getModuleResource = (module: webpack.compilation.Module): string => {
  return (module as any).resource?.split('!').pop().split('?').shift() ?? ''
}

const getModule = (
  module: webpack.compilation.Module
): webpack.compilation.Module | undefined => {
  if ((module as any).resource) {
    return module
  }

  if ((module as any).rootModule) {
    return getModule((module as any).rootModule)
  }

  return undefined
}

const travelDownModule = (
  module: webpack.compilation.Module,
  callback: (module: webpack.compilation.Module) => void | true
) => {
  const queue = (module as any).dependencies.map(
    (dependency: any) => dependency.module
  )
  const visited = new Set<webpack.compilation.Module>()

  while (queue.length) {
    const currentModule = queue.shift()

    if (!currentModule) {
      continue
    }

    if (visited.has(currentModule)) {
      continue
    }

    visited.add(currentModule)

    const shouldReturn = callback(currentModule)

    if (shouldReturn === true) {
      return
    }

    /**
     * handle dependencies
     */
    for (const dependency of (currentModule as any).dependencies) {
      if (dependency.module) {
        if (!visited.has(dependency.module)) {
          queue.push(dependency.module)
        }
      }
    }

    /**
     * handle concatenated modules
     */
    if ((currentModule as any).modules) {
      for (const submodule of (currentModule as any).modules) {
        if (!visited.has(submodule)) {
          queue.push(submodule)
        }
      }
    }
  }
}

const visitedSetWeakMap = new WeakMap<
  webpack.compilation.Compilation,
  Set<webpack.compilation.Module>
>()

export const handleControllerScriptModule = (
  compilation: webpack.compilation.Compilation,
  module: webpack.compilation.Module,
  chunk: webpack.compilation.Chunk,
  emitAsset: (file: string, source: any) => void
) => {
  if (!visitedSetWeakMap.has(compilation)) {
    visitedSetWeakMap.set(compilation, new Set())
  }

  const visited = visitedSetWeakMap.get(
    compilation
  ) as Set<webpack.compilation.Module>

  if (visited.has(module)) {
    return
  }

  if ((module as any).modules) {
    for (const submodule of (module as any).modules) {
      handleControllerScriptModule(compilation, submodule, chunk, emitAsset)
    }
    return
  }

  if (!(module as any).resource) {
    return
  }

  visited.add(module)

  const resourcePath = getModuleResource(module)

  if (!controllerScriptRegexp.test(resourcePath)) {
    return
  }

  const controllerScriptModule = module

  const controllerScriptResourcePath = getModuleResource(controllerScriptModule)

  const dirname = path.dirname(controllerScriptResourcePath)

  const controllerStyleModule: webpack.compilation.Module | undefined = (
    controllerScriptModule as any
  ).dependencies.find((dependency: any) => {
    if (!dependency.module) {
      return false
    }

    const dependencyResourcePath = getModuleResource(dependency.module)

    return (
      controllerStyleRegexp.test(dependencyResourcePath) &&
      path.dirname(dependencyResourcePath) === dirname
    )
  })?.module

  if (!controllerStyleModule) {
    return
  }

  const content = [] as string[]

  travelDownModule(controllerScriptModule, (module) => {
    const resourcePath = getModuleResource(module)

    if (!styleRegexp.test(resourcePath)) {
      return
    }

    const styleInfo = assetStyleInfo(compilation.compiler, resourcePath)

    content.push(`/****** ${styleInfo.filename} ******/`)
    content.push(styleInfo.content)
  })

  const controllerStyleResourcePath = getModuleResource(controllerStyleModule)
  const controllerStyleInfo = assetStyleInfo(
    compilation.compiler,
    controllerStyleResourcePath
  )
  const oldFilename = controllerStyleInfo.filename

  const sourceCode = content.join('\n')
  const source = new RawSource(content.join('\n'))
  const newFilename = controllerStyleInfo.getFilename(sourceCode)

  emitAsset(newFilename, source)

  if (oldFilename === newFilename) {
    return
  }

  for (const file of chunk.files) {
    if (file.endsWith('.js')) {
      const source = compilation.assets[file]

      if (!source) {
        throw new Error(`asset ${file} not found`)
      }

      const code = source.source().replaceAll(oldFilename, newFilename)
      const newSource = new RawSource(code)

      compilation.assets[file] = newSource
      console.log('replace', oldFilename, 'with', newFilename, 'in', file)
    }
  }
}

export default function ImvcStyleLoader(
  this: webpack.loader.LoaderContext,
  content: string
) {
  const compiler = this._compiler
  const module = this._module
  const loaderIndex = this.loaderIndex
  const resourcePath = getModuleResource(module)

  const extractFilename = (source: string) => {
    return source
      .replace('module.exports = ', '')
      .replace('export default ', '')
      .replace(/['";]+/g, '')
      .slice(1)
  }

  const getFilename: GetStyleFilenameFn = (newContent) => {
    this.loaderIndex = loaderIndex

    const self = Object.create(this)

    // shadow emitFile
    self.emitFile = (
      filename: string,
      content: Buffer | string,
      sourceMap: any
    ) => {}

    const newResource = fileLoader.call(self, newContent)
    const newFilename = extractFilename(newResource)

    return newFilename
  }

  const sourceCode = fileLoader.call(this, content)
  const filename = extractFilename(sourceCode)

  const styleInfo: StyleInfo = {
    filename,
    content,
    getFilename,
  }

  setStyleInfo(compiler, resourcePath, styleInfo)

  return sourceCode
}
