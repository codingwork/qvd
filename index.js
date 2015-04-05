var vd = require('./vd')
  , render = require('./render');

module.exports = {
  diff: vd.diff,
  h: vd.h,
  render: render
};