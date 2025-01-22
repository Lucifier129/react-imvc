process.env.NODE_ENV = process.env.NODE_ENV || 'development'

import yargs from 'yargs'
import start from '../start'
import getConfig from '../config'
import defaultConfig from '../config/config.defaults'

if (process.env.NODE_ENV === 'development') {
  let config = getConfig(yargs.argv)
  require('@babel/register')({
    ...config.babel(defaultConfig),
    extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx'],
  })
}

start(yargs.argv)
