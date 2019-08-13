require('@babel/register')({
  ...require('../config/babel')(true),
  extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx']
})

import build from './index'
export default build
