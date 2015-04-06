var diff = vd.diff
  , h = vd.h
  , patch = vd.patch
  , render = vd.render
  , container = document.getElementById('container')
  , a = h('div', { style: { color: '#fff' } });

describe('render', function () {
  it('should able render a template', function () {
    var div;
    container.innerHTML = render(a);
    div = container.childNodes[0];
    div.tagName.toLowerCase().should.equal('div');
    div.style.color.should.equal('rgb(255, 255, 255)');
  });

  it('should able rerender properties', function () {
    var b = h('div', { style: { color: '#000' } })
      , patches = diff(a, b)
      , div;

    patch(patches, container);
    div = container.childNodes[0];
    div.style.color.should.equal('rgb(0, 0, 0)');

    b = h('div', { style: { background: '#000' } });
    patches = diff(a, b);
    patch(patches, container);
    div.style.color.should.equal('');
    div.style.background.should.equal('rgb(0, 0, 0)');

    b = h('div');
    patches = diff(a, b);
    patch(patches, container);
    div.style.length.should.equal(0);

    b = h('div', { 'data-id': '123456' });
    patches = diff(a, b);
    patch(patches, container);
    div.getAttribute('data-id').should.equal('123456');
  });

  it('should able insert node', function () {
    var b = h('div', null, ['hello'])
      , patches = diff(a, b)
      , div, node;

    patch(patches, container);
    div = container.childNodes[0];
    node = div.childNodes[0];
    node.nodeType.should.equal(3);
    node.nodeValue.should.equal('hello');
    
    a = h('div');
    container.innerHTML = render(a);
    div = container.childNodes[0];

    b = h('div', null, [h('p', { style: { color: '#000' } }, ['hello'])]);
    patches = diff(a, b);
    patch(patches, container);
    node = div.childNodes[0];
    node.tagName.toLowerCase().should.equal('p');
    node.innerText.should.equal('hello');
    node.style.color.should.equal('rgb(0, 0, 0)');
  });

  it('should able replace node', function () {
    var b = h('div', null, [h('span', null, ['tencent'])])
      , patches = diff(a, b)
      , div
      , node;

    patch(patches, container);
    div = container.childNodes[0];
    node = div.childNodes[0];
    node.tagName.toLowerCase().should.equal('span');
    node.innerText.should.equal('tencent');
  });

  it('should able remove node', function () {
    var b = h('div')
      , patches = diff(a, b)
      , div;

    patch(patches, container);
    div = container.childNodes[0];
    div.childNodes.length.should.equal(0);
  });
});
