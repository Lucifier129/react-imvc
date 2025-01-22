/**
 * 对console未定义及console方法未定义时，补充定义空对象、空函数，防止报错
 * 如IE 9在未开启过Dev Tools时，console对象将会是未定义
 */
export interface Window {
  console?: any
}

function consolePolyfill(window: Window): void {
  // Avoid `console` errors in browsers that lack a console.
  let method
  let noop = function () {}
  let methods = [
    'assert',
    'clear',
    'count',
    'debug',
    'dir',
    'dirxml',
    'error',
    'exception',
    'group',
    'groupCollapsed',
    'groupEnd',
    'info',
    'log',
    'markTimeline',
    'profile',
    'profileEnd',
    'table',
    'time',
    'timeEnd',
    'timeline',
    'timelineEnd',
    'timeStamp',
    'trace',
    'warn',
    'msIsIndependentlyComposed',
  ]
  let length = methods.length
  let console = (window.console = window.console || {})

  while (length--) {
    method = methods[length]

    // Only stub undefined methods.
    if (!console[method]) {
      console[method] = noop
    }
  }
}

consolePolyfill(typeof window !== 'undefined' ? window : {})
