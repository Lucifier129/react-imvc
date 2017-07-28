var gulp = require('gulp')
var webpack = require('webpack')
var getConfig = require('../config')
var createGulpTask = require('./createGulpTask')
var createWebpackClientConfg = require('./createWebpackClientConfg')

module.exports = function build(options) {
	var config = getConfig(options)

	return Promise.all([
		startGulp(config),
		startWebpack(config),
	])
	.catch(function(error) {
		console.error(error)
	})
}

function startWebpack(config) {
	var webpackConfig = createWebpackClientConfg(config)
	return new Promise(function(resolve, reject) {
		webpack(webpackConfig, function(error, stats) {
			if (err) {
				reject(error)
			} else {
				console.log('[webpack:build]', stats.toString({
					chunks: false, // Makes the build much quieter
					colors: true
				}))
				resolve()
			}
		})
	})
}


function startGulp(config) {
	createGulpTask(config)
	return new Promise(function(resolve, reject) {
		gulp.start('default', function(error) {
			if (error) {
				reject(error)
			} else {
				resolve()
			}
		})
	})
}