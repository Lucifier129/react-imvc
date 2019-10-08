process.env.NODE_ENV = process.env.NODE_ENV || 'development'

import yargs from 'yargs'
import start from '../start/index'
import getConfig from '../config'

if (process.env.NODE_ENV === 'development') {
  let config = getConfig(yargs.argv)
  require('@babel/register')({
    ...config.babel(true),
    extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx']
  })
}

start(yargs.argv)
