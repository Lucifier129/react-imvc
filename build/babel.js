require('@babel/register')({
  ...require('../config/babel')(true),
  extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx']
})
module.exports = require('./index')
