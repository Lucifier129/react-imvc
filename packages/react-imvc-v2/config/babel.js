module.exports = (isServer = true, config = {}) => {
    let presets = [
        '@babel/preset-env',
        '@babel/preset-react',
        // typescript
        [
            '@babel/preset-typescript',
            {
                isTSX: true,
                allExtensions: true,
                allowNamespaces: true,
            },
        ],
    ]
    let plugins = [
        config.useBabelRuntime && ['@babel/plugin-transform-runtime', { regenerator: false }],
        '@babel/plugin-proposal-function-bind',
        '@babel/plugin-proposal-export-default-from',
        ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
        '@babel/plugin-proposal-do-expressions',
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        '@babel/plugin-proposal-function-sent',
        '@babel/plugin-proposal-throw-expressions',
        '@babel/plugin-syntax-import-meta',
        ['@babel/plugin-transform-class-properties', { loose: false }],
        ['@babel/plugin-transform-nullish-coalescing-operator', { loose: false }],
        ['@babel/plugin-transform-optional-chaining', { loose: false }],

        config.useCoverage && ['istanbul'],
    ].filter(Boolean)

    return {
        presets,
        plugins,
    }
}
