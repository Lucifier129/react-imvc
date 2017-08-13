var path = require('path')
var gulp = require('gulp')
var webpack = require('webpack')
var getConfig = require('../config')
var createGulpTask = require('./createGulpTask')
var createWebpackClientConfg = require('./createWebpackClientConfig')
var del = require('del')

getConfig = getConfig.default || getConfig

module.exports = function build(options) {
	var config = getConfig(options)
	Promise.resolve()
		.then(() => delPublish(path.join(config.root, config.publish)))
		.then(() => startGulp(config))
		.then(() => startWebpack(config))
		.catch((error) => console.error(error))
}

function delPublish(folder) {
	console.log(`delete publish folder: ${folder}`)
	return del(folder)
}

function startWebpack(config) {
	var webpackConfig = createWebpackClientConfg(config)
	return new Promise(function(resolve, reject) {
		webpack(webpackConfig, function(error, stats) {
			if (error) {
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