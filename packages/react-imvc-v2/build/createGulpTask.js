const path = require('path')
const chalk = require('chalk')
const gulp = require('gulp')
const log = require('fancy-log')
const plumber = require('gulp-plumber')
const cleanCSS = require('gulp-clean-css')
const htmlmin = require('gulp-htmlmin')
const imagemin = require('gulp-imagemin')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')

const createConfig = (options) => {
    let root = options.root
    let src = path.join(root, options.src)
    let publish = path.join(root, options.publish)
    let staticPath = path.join(publish, options.static)
    let config = {
        css: {
            src: [src + '/**/*.css'],
            dest: staticPath,
        },
        html: {
            src: [src + '/**/*.@(html|htm)'],
            dest: staticPath,
        },
        img: {
            src: [src + '/**/*.@(jpg|jepg|png|gif|ico)'],
            dest: staticPath,
        },
        js: {
            src: [src + '/lib/!(es5)/**/*.@(js|ts|jsx|tsx)', src + '/lib/*.@(js|ts|jsx|tsx)'],
            dest: staticPath + '/lib',
        },
        es5: {
            src: [src + '/lib/es5/**/*.@(js|ts|jsx|tsx)'],
            dest: staticPath + '/lib/es5',
        },
        copy: {
            src: [src + '/**/!(*.@(html|htm|css|js|ts|jsx|tsx))', `!${src}/**/__tests__/**`],
            dest: staticPath,
        },
        publishCopy: {
            src: [
                root + `/*`,
                root + `/!(node_modules|buildportal-script)/**/*`,
                `!${root}/@(node_modules|buildportal-script)/**`,
                `!${path.join(root, options.publish, '**')}`,
            ],
            dest: publish,
        },
        publishBabel: {
            src: [
                root + `/!(node_modules|buildportal-script)/**/*.@(js|ts|jsx|tsx)`,
                root + '/*.@(js|ts|jsx|tsx)',
                `!${path.join(root, options.publish, '**')}`,
            ],
            dest: publish,
        },
    }

    for (let key in options.gulp) {
        if (key in config) {
            // if options.gulp[key] === false, remove this task
            if (options.gulp[key] === false) {
                delete config[key]
            } else if (options.gulp[key]) {
                config[key].src = config[key].src.concat(options.gulp[key])
            }
        }
    }

    return config
}

const removeBabelRuntimePlugin = (babelConfig) => {
    /**
     * Remove @babel/plugin-transform-runtime
     * 因为 gulp 编译的文件可能不会被 bundle，无法使用 require('@babel/runtime')，所以需要把 runtime 代码内联
     */
    babelConfig.plugins = (babelConfig.plugins || []).filter((plugin) => {
        if (Array.isArray(plugin)) {
            return plugin[0].includes('runtime') ? false : true
        } else if (typeof plugin === 'string') {
            return plugin.includes('runtime') ? false : true
        }
        return true
    })

    return babelConfig
}

module.exports = function createGulpTask(options) {
    let config = Object.assign(createConfig(options))

    let minifyCSS = () => {
        if (!config.css) {
            return
        }
        return gulp
            .src(config.css.src)
            .pipe(plumber())
            .pipe(
                cleanCSS(
                    {
                        debug: true,
                    },
                    (details) => {
                        var percent = ((details.stats.minifiedSize / details.stats.originalSize) * 100).toFixed(2)
                        var message = `${details.name}(${chalk.green(percent)}%)`
                        log('gulp-clean-css:', message)
                    },
                ),
            )
            .pipe(gulp.dest(config.css.dest))
    }

    let minifyHTML = () => {
        if (!config.html) {
            return
        }
        return gulp
            .src(config.html.src)
            .pipe(plumber())
            .pipe(
                htmlmin({
                    collapseWhitespace: true,
                }),
            )
            .pipe(gulp.dest(config.html.dest))
    }

    let minifyImage = () => {
        if (!config.img) {
            return
        }
        return gulp.src(config.img.src).pipe(plumber()).pipe(imagemin()).pipe(gulp.dest(config.img.dest))
    }

    let minifyES6 = () => {
        if (!config.js) {
            return
        }
        return gulp
            .src(config.js.src)
            .pipe(plumber())
            .pipe(babel(removeBabelRuntimePlugin(options.babel(false, options)), { babelrc: false }))
            .pipe(uglify())
            .pipe(gulp.dest(config.js.dest))
    }

    let minifyES5 = () => {
        if (!config.es5) {
            return
        }
        return gulp.src(config.es5.src).pipe(plumber()).pipe(uglify()).pipe(gulp.dest(config.es5.dest))
    }

    let publishCopy = () => {
        if (!config.publishCopy) {
            return
        }
        return gulp.src(config.publishCopy.src).pipe(plumber()).pipe(gulp.dest(config.publishCopy.dest))
    }

    let publishBabel = () => {
        if (!config.publishBabel) {
            return
        }
        return gulp
            .src(config.publishBabel.src)
            .pipe(plumber())
            .pipe(babel(options.babel(true, options), { babelrc: false }))
            .pipe(gulp.dest(config.publishBabel.dest))
    }

    let copy = () => {
        if (!config.copy) {
            return
        }
        return gulp.src(config.copy.src).pipe(plumber()).pipe(gulp.dest(config.copy.dest))
    }

    let parallelList = [
        config.html && minifyHTML,
        config.css && minifyCSS,
        config.es5 && minifyES5,
        config.js && minifyES6,
        config.img && minifyImage,
    ].filter(Boolean)

    let seriesList = [
        config.publishCopy && publishCopy,
        config.publishBabel && publishBabel,
        config.copy && copy,
    ].filter(Boolean)

    return gulp.series(...seriesList, gulp.parallel(...parallelList))
}
