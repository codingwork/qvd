var vd = require('./')
  , h = vd.h
  , patch = vd.patch
  , diff = vd.diff;

var a1 = h('div')
  , a2 = h('div', null, [h('p')]);

var patches = diff(a1, a2);

patch(patches);
