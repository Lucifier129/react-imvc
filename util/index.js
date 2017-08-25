export default {
  toJson,
  toText,
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

function toJson(res) {
  return res.json();
}

function toText(res) {
  return res.text();
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

const path_separator_regexp = /\.|\/|:/
const updateItem = (list, key, index, path) => {
  if (index === path.length - 1) {
    list[index][key] = value;
  } else {
    let target = list[index][key];
    if (Array.isArray(target)) {
      target = target.concat();
    } else {
      target = { ...target };
    }
    list[index][key] = target;
    list.push(target);
  }
  return list;
}
function setValueByPath(obj, path, value) {
  path = !Array.isArray(path) ? path.split(path_separator_regexp) : path;
  let list = path.reduce(updateItem, [{ ...obj }]);
  return list[0];
}

function getValueByPath(obj, path) {
  path = !Array.isArray(path) ? path.split(path_separator_regexp) : path;
  return path.reduce((ret, key) => ret[key], obj);
}
