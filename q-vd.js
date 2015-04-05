/**
 * TODO
 * q-vd directive for Q.js
 * @example
 * <ul q-vd="data">
 *   <li>
 *    <img src="avatar.png" class="profile" />
 *    <h3>{[this.user.firstName, this.user.lastName].join(' ')}</h3>
 *   </li>
 * </ul>
 * Just use jsx-transform transform to:
 * h('li', null, [
 *   h('img', { src: "avatar.png", class: "profile" }),
 *   h('h3', null, [[this.user.firstName, user.lastName].join(' ')])
 * ]);
 * q-vd directive will bind data to this, and when data change, it will rerender the dom
 */
var Q = require('Q')
  , h = require('./vd').h
  , diff = require('./vd').diff
  , render = require('./render')
  , vds = {}
  , jsxs = {}
  , uid = 0;

function Jsx(name, jsx) {
  if (jsx) {
    jsxs[name] = new Function('h', jsx);
  } else {
    jsx = jsxs[name];
    if (!jsx) throw new Error('jsx ' + name + ' not exists.');
    return jsx;
  }
}

function first(name, el, data) {
  var jsx = Jsx(name)
    , vd;
  vd = jsx.call(data, h);
  el.innerHTML = render(vd);
  // TODO need to bind ele & vd
  el.vdId = ++uid;
  vds[uid] = vd;
}

function update(data) {
  var el = this.el
    , name = this.arg
    , vdId = el.vdId;
  if (!vdId) return first(name, el, data);
  var aVd = vds[vdId]
    , jsx = Jsx(name)
    , bVd
    , patches;
  bVd = jsx.call(data, h);
  patches = diff(aVd, bVd);
  // TODO need to deal with patches
  vds[vdId] = bVd;
}

Q.jsx = Jsx;
Q.options.directive.vd = update;