// TODO in the rough
var OPERATE = require('./lib/operate')
  , DEAL = {};

function find(vd, vds) {
  var i = vds.indexOf(vd)
    , res;
  if (!(~i)) {
    vds.every(function (item, j) {
      if (!item.chlidren || !item.chlidren.length) return true;
      res = find(vd, item.chlidren);
      if (res) {
        res = [].push.apply([j], res);
        return false;
      } else {
        return true;
      }
    });
    return res;
  }
  return [i];
}

function getRef(vd, root, a) {
  var ref = vd.ref;
  if (ref) return ref;
  if (!root || !a) throw new Error('Should bind the reference node.');
  var indexes = find(vd, [a]);
  if (!indexes) throw new Error('Couldn\'t find the reference node.');
  ref = root;
  for (var i = 1, l = indexes.length; i < l; i++) {
    ref = ref.childNodes[indexes[i]];
  }
  vd.ref = ref;
  return ref;
}

function create() {

}

DEAL[OPERATE.REMOVE] = function (item, root, a) {
  var node = getRef(item.from, root, a);
  node.parentNode.removeChild(node);
  item.from.ref = null;
};

DEAL[OPERATE.INSERT] = function (item, root, a) {
  var node = create(item.from)
    , parent = getRef(item.to, root, a);
  parent.appendChild(node);
};

DEAL[OPERATE.REPLACE] = function (item, root, a) {
  var node = create(item.from)
    , target = getRef(item.to, root, a);
  target.parentNode.replaceChild(node, target);
  item.to.ref = null;
};

DEAL[OPERATE.PROPS] = function (item, root, a) {
  var node = getRef(item.from, root, a)
    , key, value, i, l, style, type;
  for (key in diff) {
    // style
    if (key === 'style') {
      style = node.style;
      value = diff[key];
      if (!value) {
        i = 0;
        l = style.length;
        for (; i < l; i++) {
          style[style[i]] = '';
        }
      } else {
        value = diff[key];
        for (i in value) {
          if (value[i] === undefined) {
            style[i] = '';
          } else {
            style[i] = value[i];
          }
        }
      }
    // property
    } else if (key in node) {
      value = diff[key];
      type = typeof node[key];
      if (value === undefined) {
        type === 'string' ?
          (node[key] = '') :
          (node[key] = null);
      } else {
        node[key] = value;
      }
    // attribute
    } else {
      value = diff[key];
      if (value === undefined) {
        node.removeAttribute(key);
      } else {
        node.setAttribute(key, value);
      }
    }
  }
};

function patch(patches, root) {
  var i = 0, l = patches.length
    , a = patches.a;
  root = root || a.hook;
  for (; i < l; i++) {
    patches[i].forEach(function (item) {
      DEAL[item.operate](item, root, a);
    });
  }
}

module.exports = patch;