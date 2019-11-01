import querystring from 'query-string'
import spawn from 'cross-spawn'
import { SpawnSyncReturns } from 'child_process'
import { getKeys } from '../util'

let command = process.argv[2]
let args = process.argv.slice(3)
let [script, paramsStr = ''] = command.split('?')
let query = querystring.parse(paramsStr)
let params = getKeys(query).map(key => {
  return query[key] ? `--${key}=${query[key]}` : `--${key}`
})
let result: SpawnSyncReturns<Buffer> | undefined = undefined

switch (script) {
  case 'build':
  case 'start':
  case 'test':
    result = spawn.sync('node', params.concat(require.resolve('../scripts/' + script), args), {
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
  process.exit(result.status as number)
}