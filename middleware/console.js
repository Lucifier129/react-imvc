/**
 * 对console未定义及console方法未定义时，补充定义空对象、空函数，防止报错
 * 如IE 9在未开启过Dev Tools时，console对象将会是未定义
 */
var _stubConsole = function stubConsole(global) {
    // Avoid `console` errors in global/browsers that lack a console.
    var method;
    var noop = function () {
    };
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn', 'msIsIndependentlyComposed'
    ];
    var length = methods.length;
    var console = (global.console = global.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
};

_stubConsole(typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});

module.exports = _stubConsole;