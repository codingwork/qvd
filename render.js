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