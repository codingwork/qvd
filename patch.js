// TODO in the rough
var OPERATE = require('./lib/operate')
  , DEAL = {};

function isText(vd) {
  return vd.tag === 'text';
}

function find(vd, vds) {
  var i = vds.indexOf(vd)
    , res, tmp;
  if (!(~i)) {
    vds.every(function (item, j) {
      if (!item.children || !item.children.length) return true;
      res = find(vd, item.children);
      if (res) {
        tmp = res;
        res = [j];
        [].push.apply(res, tmp);
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
  ref = root.childNodes[0];
  for (var i = 1, l = indexes.length; i < l; i++) {
    ref = ref.childNodes[indexes[i]];
  }
  vd.ref = ref;
  return ref;
}

function setProps(to, from, node) {
  for (key in from) {
    // style
    if (key === 'style') {
      style = node.style;
      value = from[key];
      if (!value) {
        style.cssText = '';
        to.style = {};
      } else {
        value = from[key];
        for (i in value) {
          if (value[i] === undefined) {
            style[i] = '';
            delete to.style[i];
          } else {
            style[i] = value[i];
            to.style[i] = value[i];
          }
        }
      }
    // property
    } else if (key in node) {
      value = from[key];
      type = typeof node[key];
      if (value === undefined) {
        type === 'string' ?
          (node[key] = '') :
          (node[key] = null);
        delete to[key];
      } else {
        node[key] = to[key] = value;
      }
    // attribute
    } else {
      value = from[key];
      if (value === undefined) {
        node.removeAttribute(key);
        delete to[key];
      } else {
        node.setAttribute(key, value);
        to[key] = value;
      }
    }
  }
}

function create(vds, parent) {
  !Array.isArray(vds) && (vds = [vds]);
  parent = parent || document.createDocumentFragment();
  var node;
  vds.forEach(function (vd) {
    if (isText(vd)) {
      node = document.createTextNode(vd.text);
    } else {
      node = document.createElement(vd.tag);
    }
    parent.appendChild(node);
    vd.children && vd.children.length &&
      create(vd.children, node);

    vd.props &&
      setProps({ style: {} }, vd.props, node);
  });
  return parent;
}

function splice(vd, a, replacement) {
  var indexes, i, l;
  indexes = find(vd, [a]);
  for (i = 1, l = indexes.length - 1; i < l; i++) {
    a = a.children[indexes[i]];
  }
  replacement ?
    a.children.splice(indexes[l], 1, replacement) :
    a.children.splice(indexes[l], 1);
}

DEAL[OPERATE.REMOVE] = function (item, root, a) {
  var node = getRef(item.from, root, a);
  node.parentNode.removeChild(node);
  item.from.ref = null;
  splice(item.from, a);
};

DEAL[OPERATE.INSERT] = function (item, root, a) {
  var node = create(item.from)
    , parent = getRef(item.to, root, a);
  parent.appendChild(node);
  item.to.children.push(item.from);
};

DEAL[OPERATE.REPLACE] = function (item, root, a) {
  var node = create(item.from)
    , target = getRef(item.to, root, a)
    , indexes
    , i
    , l;
  target.parentNode.replaceChild(node, target);
  item.to.ref = null;
  splice(item.to, a, item.from);
};

DEAL[OPERATE.PROPS] = function (item, root, a) {
  var props = item.from.props
    , node = getRef(item.from, root, a)
    , diff = item.diff
    , key, value, i, l, style, type;
  setProps(props, diff, node);
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