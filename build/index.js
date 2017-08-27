process.env.NODE_ENV = process.env.NODE_ENV || 'production'

var fs = require('fs')
var del = require('del')
var path = require('path')
var gulp = require('gulp')
var webpack = require('webpack')
var start = require('../start')
var getConfig = require('../config')
var createGulpTask = require('./createGulpTask')
var createWebpackClientConfg = require('./createWebpackClientConfig')

getConfig = getConfig.default || getConfig

module.exports = function build(options) {
	var config = getConfig(options)
	return Promise.resolve()
		.then(() => delPublish(path.join(config.root, config.publish)))
		.then(() => startGulp(config))
		.then(() => startWebpack(config))
		.then(() => startStaticEntry(config))
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

async function startStaticEntry(config) {
	if (!config.staticEntry) {
		return
	}
	console.log(`start generating static entry file`)

	var staticEntryConfig = {
		...config,
		root: path.join(config.root, config.publish),
		publicPath: config.publicPath || '.',
		appSettings: {
			...config.appSettings,
			type: 'createHashHistory',
		},
		SSR: false,
	}

	var {server} = await start({
		config: staticEntryConfig
	})

	var url = `http://localhost:${config.port}`
	var response = await fetch(url)
	var html = await response.text()
	let staticEntryPath = path.join(config.root, config.publish, config.static, config.staticEntry)

	server.close()

	return new Promise((resolve, reject) => {
		fs.writeFile(staticEntryPath, html, error => {
			error ? reject(error) : resolve()
		})
	})
}