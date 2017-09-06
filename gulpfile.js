var path = require('path')
var chalk = require('chalk')
var gulp = require('gulp')
var gutil = require('gulp-util')
var plumber = require('gulp-plumber')
var babel = require('gulp-babel')

var dest = './publish'
// dest = '../react-imvc-template/node_modules/react-imvc'

gulp.task('copy', () => {
	return gulp
		.src([
			'./!(node_modules|publish)/**/*',
			'./!(node_modules|publish)',
			'./.!(git)*',
			'./!*.js'
		])
		.pipe(plumber())
		.pipe(gulp.dest(dest))
})

gulp.task('babel', ['copy'], () => {
	return gulp
		.src([
			'./!(node_modules|publish)/**/*.js',
			'./*.js'
		])
		.pipe(babel())
		.pipe(plumber())
		.pipe(gulp.dest(dest))
})

gulp.task('watch', () => {
	gulp
		.watch([
			'./!(node_modules|publish)**/*',
			'./!(node_modules|publish)'
		], ['babel'])
		.on('change', function(event) {
			console.log('File ' + event.path + ' was ' + event.type + ', running tasks...')
		})
		.on('error', function(error) {
			console.error(error)
		})

})

gulp.task('default', ['babel'])