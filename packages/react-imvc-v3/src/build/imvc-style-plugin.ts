import * as webpack from 'webpack'
import { handleControllerScriptModule } from './imvc-style-loader'

export type ImvcStylePluginOptions = {
  emitFile?: boolean
}

export default class ImvcStylePlugin {
  options: ImvcStylePluginOptions
  constructor(options: ImvcStylePluginOptions) {
    this.options = options
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.compilation.tap('ImvcStylePlugin', (compilation) => {
      const emitFile = (fileName: string, source: any) => {
        if (!!this.options.emitFile) {
          ;(compilation as any).emitAsset(fileName, source)
        }
      }

      compilation.hooks.optimizeChunkAssets.tap('ImvcStylePlugin', (chunks) => {
        for (const chunk of chunks) {
          for (const module of chunk.modulesIterable) {
            handleControllerScriptModule(compilation, module, chunk, emitFile)
          }
        }
      })
    })
  }
}
