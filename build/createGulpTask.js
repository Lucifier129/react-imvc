var path = require('path')
var chalk = require('chalk')
var gulp = require('gulp')
var gutil = require('gulp-util')
var plumber = require('gulp-plumber')
var cleanCSS = require('gulp-clean-css')
var htmlmin = require('gulp-htmlmin')
var imagemin = require('gulp-imagemin')
var uglify = require('gulp-uglify')
var babel = require('gulp-babel')

var createConfig = options => {
	var root = options.root
	var src = path.join(root, options.src)
	var publish = path.join(root, options.publish)
	var staticPath = path.join(publish, options.static)
	var config =  {
		css: {
			src: [src + '/**/*.css'],
			dest: staticPath
		},
		html: {
			src: [src + '/**/*.@(html|htm)'],
			dest: staticPath
		},
		img: {
			src: [src + '/**/*.@(jpg|jepg|png|gif|ico)'],
			dest: staticPath
		},
		js: {
			src: [src + '/lib/**/*.js'],
			dest: staticPath + '/lib'
		},
		copy: {
			src: [src + '/**/*.!(html|htm|css|js)'],
			dest: staticPath
		},
		publishCopy: {
			src: [
				root + `/!(node_modules|${options.publish}|buildportal-script)/**/*`,
				root + `/!(node_modules|${options.publish}|buildportal-script)`
			],
			dest: publish
		},
		publishBabel: {
			src: [
				root + `/!(node_modules|${options.publish}|buildportal-script)/**/*.js`,
				publish + '/*.js'
			],
			dest: publish
		}
	}

	for (let key in options.gulp) {
		if (config.hasOwnProperty(key) && options.gulp[key]) {
			config[key].src = config[key].src.concat(options.gulp[key])
		}
	}

	return config
}

module.exports = function createGulpTask(options) {
	var config = Object.assign(createConfig(options))

	gulp.task('minify-css', () => {
		if (!config.css) {
			return
		}
		return gulp
			.src(config.css.src)
			.pipe(plumber())
			.pipe(
				cleanCSS({
						debug: true,
						compatibility: 'ie7'
					},
					(details) => {
						var percent = (details.stats.minifiedSize /
							details.stats.originalSize *
							100).toFixed(2)
						var message = `${details.name}(${chalk.green(percent)}%)`
						gutil.log('gulp-clean-css:', message)
					}
				)
			)
			.pipe(gulp.dest(config.css.dest))
	})

	gulp.task('minify-html', () => {
		if (!config.html) {
			return
		}
		return gulp
			.src(config.html.src)
			.pipe(plumber())
			.pipe(
				htmlmin({
					collapseWhitespace: true
				})
			)
			.pipe(gulp.dest(config.html.dest))
	})

	gulp.task('minify-img', () => {
		if (!config.img) {
			return
		}
		return gulp
			.src(config.img.src)
			.pipe(plumber())
			.pipe(imagemin())
			.pipe(gulp.dest(config.img.dest))
	})

	gulp.task('minify-js', () => {
		if (!config.js) {
			return
		}
		return gulp
			.src(config.js.src)
			.pipe(plumber())
			.pipe(uglify())
			.pipe(gulp.dest(config.js.dest))
	})

	gulp.task('copy', () => {
		if (!config.copy) {
			return
		}
		return gulp
			.src(config.copy.src)
			.pipe(plumber())
			.pipe(gulp.dest(config.copy.dest))
	})

	gulp.task('publish-copy', () => {
		if (!config.publishCopy) {
			return
		}
		return gulp
			.src(config.publishCopy.src)
			.pipe(plumber())
			.pipe(gulp.dest(config.publishCopy.dest))
	})

	gulp.task('publish-babel', ['publish-copy'], () => {
		if (!config.publishBabel) {
			return
		}
		return gulp
			.src(config.publishBabel.src)
			.pipe(babel())
			.pipe(plumber())
			.pipe(gulp.dest(config.publishBabel.dest))
	})

	gulp.task('publish', ['publish-babel'])

	gulp.task('default', ['minify-html', 'minify-css', 'minify-js', 'copy', 'publish'])
}