#!/usr/bin/env node

var spawn = require('cross-spawn')
var script = process.argv[2]
var args = process.argv.slice(3)
var result

switch (script) {
  case 'build':
  case 'start':
  case 'test':
    result = spawn.sync('node', args.concat(require.resolve('../scripts/' + script)), {
      stdio: 'inherit'
    })
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
        '`kill -9` on the process.'
      )
      process.exit(1)
      break
    case 'SIGTERM':
      console.log(
        'The build failed because the process exited too early. ' +
        'Someone might have called `kill` or `killall`, or the system could ' +
        'be shutting down.'
      )
      process.exit(1)
      break
  }
  process.exit(result.status)
}