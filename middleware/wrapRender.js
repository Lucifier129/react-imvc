/**
 * wrap 渲染函数，提供一些默认数据和通用数据
 */

module.exports = function wrapRender ({ defaults }) {
  return (req, res, next) => {
    let _render = res.render

    res.render = function (viewName, options, callback) {
      let finalOptions = Object.assign({}, defaults, options)
      return _render.call(this, viewName, finalOptions, callback)
    }

    next()
  }
}
