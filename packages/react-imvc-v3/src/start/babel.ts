import configBabel from '../config/babel'
import defaultConfig from '../config/config.defaults'

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

require('@babel/register')({
  ...configBabel(defaultConfig),
  extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx'],
})

import start from './index'
export default start
