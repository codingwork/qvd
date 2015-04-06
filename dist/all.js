define("vd", [], function() { return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var vd = __webpack_require__(1)
	  , render = __webpack_require__(2)
	  , patch = __webpack_require__(3);

	module.exports = {
	  diff: vd.diff,
	  h: vd.h,
	  render: render,
	  patch: patch
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var OPERATE = __webpack_require__(4);

	function isText(node) {
	  return node.tag === 'text';
	}

	function isEle(node) {
	  return node.tag !== 'text';
	}

	function isObject(obj) {
	  return typeof obj === 'object';
	}

	function remove(arr, index, key) {
	  arr.splice(index, 1);

	  return {
	    from: index,
	    key: key
	  };
	}

	function walk(a, b, patches, index) {
	  patches[index] = apply = patches[index] || [];
	  // no need to walk
	  if (b == null) {
	    apply.push({
	      from: a,
	      operate: OPERATE.REMOVE
	    });
	  // a and b is element
	  } else if(isEle(a) && isEle(b)) {
	    if (a.tag === b.tag) {
	      var diff = diffProps(a.props, b.props);
	      if (diff) {
	        apply.push({
	          diff: diff,
	          from: a,
	          operate: OPERATE.PROPS
	        });
	      }
	      diffChildren(a, b, patches, apply, index);
	    } else {
	      apply.push({
	        from: b,
	        to: a,
	        operate: OPERATE.REPLACE
	      });
	    }
	  // at least one is text
	  } else {
	    if (
	      isEle(a) || isEle(b) 
	        || a.text !== b.text
	    ) {
	      apply.push({
	        from: b,
	        to: a,
	        operate: OPERATE.REPLACE
	      });
	    }
	  }
	}

	function diffProps(a, b, apply) {
	  var key, aVal, bVal, diff;

	  for (key in a) {
	    if (!(key in b)) {
	      diff = diff || {};
	      diff[key] = undefined;
	      continue;
	    }

	    aVal = a[key];
	    bVal = b[key];

	    if (aVal === bVal) {
	      continue;
	    } else if (isObject(aVal) && isObject(bVal)) {
	      var objectDiff = diffProps(aVal, bVal);
	      if (objectDiff) {
	        diff = diff || {};
	        diff[key] = objectDiff;
	      }
	    } else {
	      diff = diff || {};
	      diff[key] = bVal;
	    }
	  }

	  for (key in b) {
	    if (!(key in a)) {
	      diff = diff || {};
	      diff[key] = b[key];
	    }
	  }

	  return diff;
	}

	function keyIndex(children) {
	  var keys = {}
	    , free = []
	    , length = children.length
	    , i = 0
	    , child;

	  for (; i < length; i++) {
	    child = children[i];

	    if (child.key) {
	      keys[child.key] = i;
	    } else {
	      free.push(i);
	    }
	  }

	  return {
	    keys: keys,     // A hash of key name to index
	    free: free     // An array of unkeyed item indices
	  };
	}

	function reorder(aChildren, bChildren) {
	  // O(M) time, O(M) memory
	  var bChildIndex = keyIndex(bChildren)
	    , bKeys = bChildIndex.keys
	    , bFree = bChildIndex.free;

	  if (bFree.length === bChildren.length) {
	    return {
	      children: bChildren,
	      moves: null
	    };
	  }

	  // O(N) time, O(N) memory
	  var aChildIndex = keyIndex(aChildren)
	    , aKeys = aChildIndex.keys
	    , aFree = aChildIndex.free;

	  if (aFree.length === aChildren.length) {
	    return {
	      children: bChildren,
	      moves: null
	    };
	  }

	  // O(MAX(N, M)) memory
	  var newChildren = []
	    , freeIndex = 0
	    , freeCount = bFree.length
	    , deletedItems = 0
	    , aItem
	    , itemIndex
	    , i = 0
	    , l = aChildren.length;

	  // Iterate through a and match a node in b
	  // O(N) time,
	  for (; i < l; i++) {
	    aItem = aChildren[i];

	    if (aItem.key) {
	      if (bKeys.hasOwnProperty(aItem.key)) {
	        // Match up the old keys
	        itemIndex = bKeys[aItem.key];
	        newChildren.push(bChildren[itemIndex]);
	      } else {
	        // Remove old keyed items
	        itemIndex = i - deletedItems++;
	        newChildren.push(null);
	      }
	    } else {
	      // Match the item in a with the next free item in b
	      if (freeIndex < freeCount) {
	        itemIndex = bFree[freeIndex++];
	        newChildren.push(bChildren[itemIndex]);
	      } else {
	        // There are no free items in b to match with
	        // the free items in a, so the extra free nodes
	        // are deleted.
	        itemIndex = i - deletedItems++;
	        newChildren.push(null);
	      }
	    }
	  }

	  var lastFreeIndex = freeIndex >= bFree.length ?
	    bChildren.length :
	    bFree[freeIndex]
	    , j = 0
	    , newItem;

	  l = bChildren.length;

	  // Iterate through b and append any new keys
	  // O(M) time
	  for (; j < l; j++) {
	    newItem = bChildren[j];

	    if (newItem.key) {
	      if (!aKeys.hasOwnProperty(newItem.key)) {
	        // Add any new keyed items
	        // We are adding new items to the end and then sorting them
	        // in place. In future we should insert new items in place.
	        newChildren.push(newItem);
	      }
	    } else if (j >= lastFreeIndex) {
	      // Add any leftover non-keyed items
	      newChildren.push(newItem);
	    }
	  }

	  var simulate = newChildren.slice()
	    , simulateIndex = 0
	    , removes = []
	    , inserts = []
	    , simulateItem
	    , wantedItem
	    , k = 0;

	  for (; k < l;) {
	    wantedItem = bChildren[k];
	    simulateItem = simulate[simulateIndex];

	    // remove items
	    while (simulateItem === null && simulate.length) {
	      removes.push(remove(simulate, simulateIndex, null));
	      simulateItem = simulate[simulateIndex];
	    }

	    if (!simulateItem || simulateItem.key !== wantedItem.key) {
	      // if we need a key in this position...
	      if (wantedItem.key) {
	        if (simulateItem && simulateItem.key) {
	          // if an insert doesn't put this key in place, it needs to move
	          if (bKeys[simulateItem.key] !== k + 1) {
	            removes.push(remove(simulate, simulateIndex, simulateItem.key));
	            simulateItem = simulate[simulateIndex];
	            // if the remove didn't put the wanted item in place, we need to insert it
	            if (!simulateItem || simulateItem.key !== wantedItem.key) {
	              inserts.push({key: wantedItem.key, to: k});
	            // items are matching, so skip ahead
	            } else {
	              simulateIndex++
	            }
	          } else {
	            inserts.push({key: wantedItem.key, to: k})
	          }
	        } else {
	          inserts.push({key: wantedItem.key, to: k})
	        }
	        k++
	      // a key in simulate has no matching wanted key, remove it
	      } else if (simulateItem && simulateItem.key) {
	        removes.push(remove(simulate, simulateIndex, simulateItem.key));
	      }
	    } else {
	      simulateIndex++;
	      k++;
	    }
	  }

	  // remove all the remaining nodes from simulate
	  while(simulateIndex < simulate.length) {
	    simulateItem = simulate[simulateIndex];
	    removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key));
	  }

	  // If the only moves we have are deletes then we can just
	  // let the delete patch remove these items.
	  if (removes.length === deletedItems && !inserts.length) {
	    return {
	      children: newChildren,
	      moves: null
	    };
	  }

	  return {
	    children: newChildren,
	    moves: {
	      removes: removes,
	      inserts: inserts
	    }
	  };
	}

	function diffChildren(a, b, patches, apply, index) {
	  var aChildren = a.children
	    , orderedSet = reorder(aChildren, b.children)
	    , bChildren = orderedSet.children
	    , aLen = aChildren.length
	    , bLen = bChildren.length
	    , len = aLen > bLen ? aLen : bLen
	    , i = 0
	    , leftNode
	    , rightNode;

	  for (var i = 0; i < len; i++) {
	    leftNode = aChildren[i];
	    rightNode = bChildren[i];
	    index += 1;

	    if (!leftNode) {
	      if (rightNode) {
	        apply.push({
	          from: rightNode,
	          to: a,
	          operate: OPERATE.INSERT
	        });
	      }
	    } else {
	      walk(leftNode, rightNode, patches, index)
	    }
	  }

	  if (orderedSet.moves) {
	    apply.push({
	      operate: OPERATE.ORDER,
	      from: orderedSet.moves,
	      to: a
	    });
	  }

	  return apply;
	}

	/**
	 * h(tagName, props, children)
	 * h('text', 'hello')
	 * {
	 *  tag: 'div',
	 *  children: [],
	 *  props: {}
	 * }
	 */
	function h(tagName, props, children) {
	  props = props || {};
	  children = children || [];
	  var key;
	  if (tagName === 'text') {
	    return {
	      tag: tagName,
	      text: props
	    };
	  } else {
	    if ('key' in props) {
	      key = props.key;
	      delete props['key'];
	    }
	    for (var i = 0, l = children.length; i < l; i++) {
	      // text
	      typeof children[i] === 'string' &&
	        (children[i] = h('text', children[i]));
	    }
	    return {
	      tag: tagName,
	      props: props,
	      children: children,
	      key: key
	    };
	  }
	}

	/**
	 * diff
	 * @param {VD} a
	 * @param {VD} b
	 */
	function diff(a, b) {
	  var patches = {}, res = [];
	  res.a = a;
	  walk(a, b, patches, 0);
	  for (var i = 0; patches[i]; i++) {
	    patches[i].length &&
	      res.push(patches[i])
	  }
	  return res;
	}

	module.exports = {
	  h: h,
	  diff: diff
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var singleTag = {
	    area: true,
	    base: true,
	    basefont: true,
	    br: true,
	    col: true,
	    command: true,
	    embed: true,
	    frame: true,
	    hr: true,
	    img: true,
	    input: true,
	    isindex: true,
	    keygen: true,
	    link: true,
	    meta: true,
	    param: true,
	    source: true,
	    track: true,
	    wbr: true,
	  }
	  , booleanAttributes = {
	    allowfullscreen: true,
	    async: true,
	    autofocus: true,
	    autoplay: true,
	    checked: true,
	    controls: true,
	    default: true,
	    defer: true,
	    disabled: true,
	    hidden: true,
	    ismap: true,
	    loop: true,
	    multiple: true,
	    muted: true,
	    open: true,
	    readonly: true,
	    required: true,
	    reversed: true,
	    scoped: true,
	    seamless: true,
	    selected: true,
	    typemustmatch: true
	  }
	  , REG_CAP = /[A-Z]/g;

	function isEle(node) {
	  return node.tag !== 'text';
	}

	function formatStyle(style) {
	  var key, value
	    , output = 'style="';

	  for (key in style) {
	    value = style[key];

	    key = key.replace(REG_CAP, function (cap) {
	      return '-' + cap.toLowerCase();
	    });

	    output += key + ': ' + value + ';';
	  }

	  return output + '"';
	}

	function formatProps(props) {
	  if (!props) return;

	  var output = ''
	    , key
	    , value;

	  for (key in props) {
	    value = props[key];

	    if (output) {
	      output += ' ';
	    }

	    if (!value && booleanAttributes[key]) {
	      output += key;
	    } else if (key === 'style') {
	      output += formatStyle(value);
	    } else {
	      output += key + '="' + value + '"';
	    }
	  }
	  return output;
	}

	function renderTag(vd) {
	  var tag = '<'+ vd.tag
	    , props = formatProps(vd.props);

	  if (props) {
	    tag += ' ' + props;
	  }

	  tag += '>';

	  if (vd.children) {
	    tag += render(vd.children);
	  }

	  if (!singleTag[vd.tag]) {
	    tag += '</' + vd.tag + '>';
	  }

	  return tag;
	}

	function renderText(vd) {
	  return vd.text;
	}


	function render(vds) {
	  !Array.isArray(vds) &&
	    (vds = [vds]);

	  var output = ''
	    , l = vds.length
	    , vd;

	  for (var i = 0; i < l; i++) {
	    vd = vds[i]

	    if (isEle(vd)) {
	      output += renderTag(vd);
	    } else {
	      output += renderText(vd);
	    }
	  }
	  return output;
	}

	module.exports = render;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	// TODO in the rough
	var OPERATE = __webpack_require__(4)
	  , DEAL = {};

	function isText(vd) {
	  return vd.tag === 'text';
	}

	function getVDByKey(vds, key, cache) {
	  cache = cache || {};
	  if (cache[key]) return cache[key];
	  for (var i = 0, l = vds.length; i < l; i++) {
	    if (vds[i].key === key) return (cache[key] = vds[i]);
	  }
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

	DEAL[OPERATE.ORDER] = function (item, root, a) {
	  var to = item.to
	    , from = item.from
	    , children = to.children
	    , parent = getRef(to, root, a)
	    , grandpa = parent.parentNode
	    , removes = from.removes
	    , inserts = from.inserts
	    , cache = {};

	  removes.forEach(function (order) {
	    var vd = getVDByKey(children, order.key, cache)
	      , node = getRef(vd, grandpa, to);
	    parent.removeChild(node);
	    splice(vd, to);
	  });
	  inserts.forEach(function (order) {
	    var vd = getVDByKey(children, order.key, cache)
	      , node = getRef(vd, grandpa, to)
	      , before = getRef(children[order.to], grandpa, to);
	    parent.insertBefore(node, before);
	    children.splice(order.to, 0, vd);
	  });
	  cache = null;
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

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  REMOVE: 1,
	  INSERT: 2,
	  REPLACE: 3,
	  ORDER: 4,
	  PROPS: 5
	};

/***/ }
/******/ ])});;