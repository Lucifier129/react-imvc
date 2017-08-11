require('babel-register')({
	ignore: function(filename) {
		console.log('filename', filename)
		if (filename.indexOf('node_modules')) {
			return true
		}
		return false
	}
})
module.exports = require('./index')