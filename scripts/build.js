process.env.NODE_ENV = process.env.NODE_ENV || 'production'
require('babel-polyfill')
require('babel-register')
let options = require('yargs').argv
require('../build')(options)