/**
 * babel-polyfil 给 Array.prototype 补了 symbol 属性
 * webpackJsonp 函数用 for in 遍历模块数组
 * 用 typeof obj === 'object' 判断数组
 * 把 symbol 属性里的对象，当做数组调用 slice 方法，在 IE8 下报错
 * 将 symbol key 删除
 */
for (var key in Array.prototype) {
  if (key.indexOf('Symbol') !== -1) {
    delete Array.prototype[key]
  }
}