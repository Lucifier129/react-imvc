const register = require('@babel/register')
import configBabel from '../config/babel'

register({
  ...configBabel(true),
  extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx']
})

import build from './index'
export default build