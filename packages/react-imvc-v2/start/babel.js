const babel = require('../config/babel')
const defaultConfig = require('../config/config.defaults')

require('@babel/register')({
    ...babel(true, defaultConfig),
    extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx'],
})

module.exports = require('./index')
