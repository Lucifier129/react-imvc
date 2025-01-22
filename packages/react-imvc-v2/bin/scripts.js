#!/usr/bin/env node

let querystring = require('query-string')
let spawn = require('cross-spawn')
let command = process.argv[2]
let args = process.argv.slice(3)
let [script, params = ''] = command.split('?')
let query = querystring.parse(params)
params = Object.keys(query).map((key) => (query[key] ? `--${key}=${query[key]}` : `--${key}`))
let result

let nodeMajorVersion = Number(process.versions.node.split('.')[0])

switch (script) {
    case 'build':
    case 'start':
    case 'test':
        result = spawn.sync(
            'node',
            [
                nodeMajorVersion >= 18 ? '--openssl-legacy-provider' : '',
                ...params,
                require.resolve('../scripts/' + script),
                ...args,
            ].filter(Boolean),
            {
                stdio: 'inherit',
            },
        )
        break
    default:
        console.log('Unknown script "' + script + '".')
        break
}

if (result) {
    switch (result.signal) {
        case 'SIGKILL':
            console.log(
                'The build failed because the process exited too early. ' +
                    'This probably means the system ran out of memory or someone called ' +
                    '`kill -9` on the process.',
            )
            process.exit(1)
            break
        case 'SIGTERM':
            console.log(
                'The build failed because the process exited too early. ' +
                    'Someone might have called `kill` or `killall`, or the system could ' +
                    'be shutting down.',
            )
            process.exit(1)
            break
    }
    process.exit(result.status)
}
