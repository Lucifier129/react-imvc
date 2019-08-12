import path from 'path'
import chalk from 'chalk'
import gulp from 'gulp'
import log from 'fancy-log'
import plumber from 'gulp-plumber'
// @ts-ignore
import cleanCSS from 'gulp-clean-css'
import htmlmin from 'gulp-htmlmin'
import imagemin from 'gulp-imagemin'
import uglify from 'gulp-uglify'
import babel from 'gulp-babel'
import { Config } from '../config'

export interface GulpConfigItem {
	src: string[],
	dest: string
}

export interface GulpConfig {
	// 需要压缩到 static 目录的 css
	css: GulpConfigItem
	// 需要压缩到 static 目录的 html
	html: GulpConfigItem

	img: GulpConfigItem
	// 需要压缩到 static 目录的 js
	js: GulpConfigItem

	es5: GulpConfigItem
	// 需要复制到 static 目录的非 html, css, js 文件
	copy: GulpConfigItem
	// 需要复制到 publish 目录的额外文件
	publishCopy: GulpConfigItem
	// 需要编译到 publish 目录的额外文件
	publishBabel: GulpConfigItem

	[propName: string]: GulpConfigItem
}

type CreateConfig = (options: Config) => GulpConfig

const createConfig: CreateConfig = options => {
  let root = options.root
  let src = path.join(root, options.src)
  let publish = path.join(root, options.publish)
  let staticPath = path.join(publish, options.static)
  let config: GulpConfig = {
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
      src: [src + '/lib/!(es5)/**/*.@(js|ts|jsx|tsx)', src + '/lib/*.@(js|ts|jsx|tsx)'],
      dest: staticPath + '/lib'
    },
    es5: {
      src: [src + '/lib/es5/**/*.@(js|ts|jsx|tsx)'],
      dest: staticPath + '/lib/es5'
    },
    copy: {
      src: [src + '/**/!(*.@(html|htm|css|js|ts|jsx|tsx))'],
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
        root +
          `/!(node_modules|${
            options.publish
          }|buildportal-script)/**/*.@(js|ts|jsx|tsx)`,
        publish + '/*.@(js|ts|jsx|tsx)'
      ],
      dest: publish
    }
  }

  for (let key in options.gulp) {
    if (config.hasOwnProperty(key) && options.gulp[key] !== undefined) {
      config[key].src = config[key].src.concat(options.gulp[key] as string[])
    }
  }

  return config
}

type CreateGulpTask = (options: Config) => gulp.TaskFunction

const createGulpTask: CreateGulpTask = (options) => {
  let config: GulpConfig = Object.assign(createConfig(options))

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
            debug: true
          },
          (details: Record<string, any>) => {
            var percent = (
              (details.stats.minifiedSize / details.stats.originalSize) *
              100
            ).toFixed(2)
            var message = `${details.name}(${chalk.green(percent)}%)`
            log('gulp-clean-css:', message)
          }
        )
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
          collapseWhitespace: true
        })
      )
      .pipe(gulp.dest(config.html.dest))
  }

  let minifyImage = () => {
    if (!config.img) {
      return
    }
    return gulp
      .src(config.img.src)
      .pipe(plumber())
      .pipe(imagemin())
      .pipe(gulp.dest(config.img.dest))
  }

  let minifyES6 = () => {
    if (!config.js) {
      return
    }
    return gulp
    .src(config.js.src)
    .pipe(plumber())
    .pipe(babel(options.babel(false)))
    .pipe(uglify())
    .pipe(gulp.dest(config.js.dest))
  }

  let minifyES5 = () => {
    if (!config.es5) {
      return
    }
    return gulp
      .src(config.es5.src)
      .pipe(plumber())
      .pipe(uglify())
      .pipe(gulp.dest(config.es5.dest))
  }

  let publishCopy = () => {
    if (!config.publishCopy) {
      return
    }
    return gulp
      .src(config.publishCopy.src)
      .pipe(plumber())
      .pipe(gulp.dest(config.publishCopy.dest))
  }

  let publishBabel = () => {
    if (!config.publishBabel) {
      return
    }
    return gulp
      .src(config.publishBabel.src)
      .pipe(plumber())
      .pipe(babel(options.babel(true)))  // babelrc: false
      .pipe(gulp.dest(config.publishBabel.dest))
  }

  let copy = () => {
    if (!config.copy) {
      return
    }
    return gulp
      .src(config.copy.src)
      .pipe(plumber())
      .pipe(gulp.dest(config.copy.dest))
  }

  return gulp.series(
    publishCopy,
    publishBabel,
    copy,
    gulp.parallel(minifyHTML, minifyCSS, minifyES5, minifyES6, minifyImage)
  )
}
export default createGulpTask