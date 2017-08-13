process.env.NODE_ENV = process.env.NODE_ENV || 'production'

let options = require('yargs').argv
require('../build')(options)