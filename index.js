var vd = require('./vd')
  , render = require('./render');
  // , patch = require('./patch');

module.exports = {
  diff: vd.diff,
  h: vd.h,
  render: render
  // patch: patch
};