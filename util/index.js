export default {
  toJSON,
  toText,
  timeoutReject,
  isAbsoluteUrl,
  mapValues,
  isThenable,
  setValueByPath,
  getValueByPath,
  getFlatList
};

function getFlatList(list) {
  let result = [];
  for (let i = 0; i < list.length; i++) {
    let item = list[i];
    if (Array.isArray(item)) {
      result = result.concat(getFlatList(item));
    } else {
      result.push(item);
    }
  }
  return result;
}

function toJSON(response) {
  // 如果 response 状态异常，抛出错误
  if (!response.ok || response.status !== 200) {
    return Promise.reject(new Error(response.statusText));
  }
  return response.json();
}

function toText(response) {
  // 如果 response 状态异常，抛出错误
  if (!response.ok || response.status !== 200) {
    return Promise.reject(new Error(response.statusText));
  }
  return response.text();
}

function timeoutReject(promise, time = 0) {
  let timeoutReject = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout Error:${time}ms`)), time);
  });
  return Promise.race([promise, timeoutReject]);
}

function isAbsoluteUrl(url) {
  return url.indexOf("http") === 0 || url.indexOf("//") === 0;
}

function mapValues(obj, fn) {
  return Object.keys(obj).reduce((result, key) => {
    result[key] = fn(obj[key], key);
    return result;
  }, {});
}

function isThenable(obj) {
  return obj != null && typeof obj.then === "function";
}

const path_separator_regexp = /\.|\/|:/;
const getPath = path =>
  !Array.isArray(path) ? path.split(path_separator_regexp) : path;

const setValue = (obj, [key, ...rest], value) => {
  obj = Array.isArray(obj) ? obj.concat() : Object.assign({}, obj);
  obj[key] = rest.length > 0 ? setValue(obj[key], rest, value) : value;
  return obj;
};
function setValueByPath(obj, path, value) {
  return setValue(obj, getPath(path), value);
}

const getValue = (ret, key) => ret[key];
function getValueByPath(obj, path) {
  return getPath(path).reduce(getValue, obj);
}
