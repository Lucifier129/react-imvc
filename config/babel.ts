export interface BabelConfig  {
  filename?: string,
  filenameRelative?: string,
  presets?: any[],
  plugins?: any[],
  highlightCode?: boolean,
  only?: string | string[],
  ignore?: string | string[],
  auxiliaryCommentBefore?: any,
  auxiliaryCommentAfter?: any,
  sourceMaps?: any,
  inputSourceMap?: any,
  sourceMapTarget?: any,
  sourceFileName?: any,
  sourceRoot?: any,
  moduleRoot?: any,
  moduleIds?: any,
  moduleId?: any,
  getModuleId?: any,
  resolveModuleSource?: any,
  keepModuleIdExtesions?: boolean,
  code?: boolean,
  ast?: boolean,
  compact?: any,
  comments?: boolean,
  shouldPrintComment?: any,
  env?: any,
  retainLines?: boolean
  babelrc?: any
}

export type GetBabelFunc = (isServer: boolean) => BabelConfig 

const Babel: GetBabelFunc = (isServer = true) => ({
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
    // typescript
    // 
    // typescript 中配置不生效
    // [
    //   '@babel/preset-typescript',
    //   {
    //     isTSX: true,
    //     allExtensions: true
    //   }
    // ]
    '@babel/preset-typescript'
  ],
  plugins: [
    // Stage 0
    '@babel/plugin-proposal-function-bind',

    // Stage 1
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-logical-assignment-operators',
    ['@babel/plugin-proposal-optional-chaining', { loose: false }],
    ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
    ['@babel/plugin-proposal-nullish-coalescing-operator', { loose: false }],
    '@babel/plugin-proposal-do-expressions',

    // Stage 2
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-throw-expressions',

    // Stage 3
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    ['@babel/plugin-proposal-class-properties', { loose: false }],
    '@babel/plugin-proposal-json-strings',
    isServer && 'dynamic-import-node'
  ].filter(Boolean)
})

export default Babel