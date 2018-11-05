process.env.NODE_ENV = process.env.NODE_ENV || 'development'

let options = require('yargs').argv

if (process.env.NODE_ENV === 'development') {
	let getConfig = require('../config')
	let config = getConfig(options)
	require('@babel/register')(config.babel(true))
}

require('../start/index')(options)
