require('babel-polyfill')
require('babel-register')
let options = require('yargs').argv
require('../build')(options)