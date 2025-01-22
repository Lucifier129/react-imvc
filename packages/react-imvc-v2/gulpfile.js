process.env.NODE_ENV = 'production'

const gulp = require('gulp')
const plumber = require('gulp-plumber')
const gulpBabel = require('gulp-babel')
const babelConfig = require('./config/babel')
const defaultConfig = require('./config/config.defaults')

const dest = './publish'

const copy = () => {
    return gulp
        .src(['./!(node_modules|publish)/**/*', './!(node_modules|publish)', './.!(git)*', './!*.js'])
        .pipe(plumber())
        .pipe(gulp.dest(dest))
}

const babel = () => {
    return gulp
        .src(['./!(node_modules|publish)/**/*.@(js|ts|jsx|tsx)', './*.@(js|ts|jsx|tsx)'])
        .pipe(gulpBabel(babelConfig(true, defaultConfig)))
        .on('error', (error) => console.log(error))
        .pipe(plumber())
        .pipe(gulp.dest(dest))
}

const watch = () => {
    return gulp
        .watch(['./!(node_modules|publish)**/*', './!(node_modules|publish)'], ['babel'])
        .on('change', function (event) {
            console.log('File ' + event.path + ' was ' + event.type + ', running tasks...')
        })
        .on('error', (error) => console.log(error))
}

exports.watch = watch
exports.default = gulp.series(copy, babel)
