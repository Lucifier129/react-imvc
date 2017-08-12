process.env.NODE_ENV = process.env.NODE_ENV || 'development'

let options = require('yargs').argv

if (process.env.NODE_ENV === 'development') {
	require('../start/babel')(options)
} else if (process.env.NODE_ENV === 'production') {
	require('../start/index')(options)
}