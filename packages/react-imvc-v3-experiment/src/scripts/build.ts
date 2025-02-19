import yargs from 'yargs'

process.env.NODE_ENV = process.env.NODE_ENV || 'production'

import build from '../build'
build(yargs.argv)
