# Refactor

## Dependence change

### Upgrade

* chalk 1.1.3 -> 2.4.2
* pnp-webpack-plugin 1.2.0 -> 1.5.0
* fork-ts-checker-webpack-plugin 0.5.2 -> 1.4.3
* terser-webpack-plugin 1.1.0 -> 1.3.0
* chalk 2.4.2 1.1.3 -> 2.4.2
* create-app 1.0.0 -> 2.0.3
* debug 2.2.0 -> 4.1.1
* del 3.0.0 -> 5.0.0
* express-react-views 0.10.5 -> 0.11.0
* fork-ts-checker-webpack-plugin 0.5.2 -> 1.4.3
* gulp-clean-css 4.0.4 -> 4.0.2
* pnp-webpack-plugin 1.2.0 -> 1.5.0
* relite 1.0.6 -> 3.0.2
* terser-webpack-plugin 1.1.0 -> 1.3.0
* yargs 8.0.2 -> 13.3.0

### add

* @types/babel-core 6.25.6
* @types/body-parser 1.17.0
* @types/classnames 2.2.9
* @types/compression 0.0.36
* @types/cookie-parser 1.4.1
* @types/cross-spawn 6.0.0
* @types/debug 4.1.4
* @types/express 4.17.0
* @types/fancy-log 1.3.1
* @types/gulp 4.0.6
* @types/gulp-babel 6.1.29
* @types/gulp-htmlmin 1.3.32
* @types/gulp-imagemin 4.1.1
* @types/gulp.plumber 0.0.32
* @types/gulp-uglify 3.0.6
* @types/helmet 0.0.43
* @types/js-cookie 2.2.2
* @types/memory-fs 0.3.2
* @types/morgan 1.7.36
* @types/node 10.12.24
* @types/node-fetch 2.5.0
* @types/node-notifier 5.4.0
* @types/querystringify 2.0.0
* @types/raf 3.4.0
* @types/react 16.8.2
* @types/react-dom 16.8.0
* @types/resolve 0.0.8
* @types/serve-favicon 2.2.30
* @types/terser-webpack-plugin 1.2.1
* @types/webpack 4.32.1
* @types/webpack-bundle-analyzer 2.13.2
* @types/webpack-dev-middleware 2.0.3
* @types/webpack-hot-middleware 2.16.5
* @types/webpack-manifest-plufin 2.0.0
* @types/yargs 13.0.1
* fs-extra 8.1.0
* querystringify 2.1.1

## Delete

* expect 1.20.2
* mocha 3.0.2
* querystring 0.2.0

### How to upgrade

1. update react-imvc to 3.x

npm

```console
npm install --save react-imvc
```

or yarn

```console
yarn add react-imvc
```

2. add typescript support

npm

```console
npm install --save-dev typescript
```

or yarn

```console
yarn add -D typescript
```

3. add tsconfig.json

template: [tsconfig.json](https://github.com/Lucifier129/react-imvc/blob/master/tsconfig.json)

### What' new
