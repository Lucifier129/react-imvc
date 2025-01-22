process.env.BABEL_ENV = 'test'
process.env.NODE_ENV = 'test'

import jest from 'jest'
import yargs from 'yargs'

import 'core-js/stable'
import 'regenerator-runtime/runtime'

process.on('unhandledRejection', (error) => {
  throw error
})

import fs from 'fs'
import path from 'path'
import getConfig from '../config'
import defaultConfig from '../config/config.defaults'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
let config = getConfig(yargs.argv)

require('@babel/register')({
  ...config.babel(defaultConfig),
  extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx'],
})

let files: string[] = []

function travelDirectoryToAddTestFiles(dir: string): void {
  fs.readdirSync(dir).forEach((file) => {
    let filename = path.join(dir, file)
    // ignore node_modules
    if (filename.indexOf('node_modules') !== -1) {
      return
    }
    // read file deeply
    if (fs.statSync(filename).isDirectory()) {
      return travelDirectoryToAddTestFiles(filename)
    }
    // add *test.js file to the jest instance
    if (
      filename.substr(-8) === '.test.js' ||
      filename.substr(-8) === '.test.ts'
    ) {
      return files.push(filename)
    }
  })
}

travelDirectoryToAddTestFiles(process.cwd())

const options = Object.assign(
  {
    roots: [process.cwd()],
    testRegexp: files,
  },
  yargs.argv
)

jest
  .runCLI(options, [process.cwd()])
  .then((success) => {
    console.log('test done')
  })
  .catch((failure) => {
    console.error(failure)
  })
