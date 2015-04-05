var qvd = require('../')
  , h = qvd.h
  , diff = qvd.diff
  , render = qvd.render
  , OPERATE = require('../lib/operate');

describe('diff', function () {
  it('should not need any operate for two equal div', function () {
    var a1 = h('div')
      , a2 = h('div')
      , b1 = h('div', { style: { color: '#fff' } })
      , b2 = h('div', { style: { color: '#fff' } })
      , c1 = h('div', { style: { color: '#fff' } }, [h('text', 'hello')])
      , c2 = h('div', { style: { color: '#fff' } }, [h('text', 'hello')])
      , d1 = h('div', null, [h('p', null, [h('text', 'hello')])])
      , d2 = h('div', null, [h('p', null, [h('text', 'hello')])]);
    
    diff(a1, a2).length.should.equal(0);
    diff(b1, b2).length.should.equal(0);
    diff(c1, c2).length.should.equal(0);
    diff(d1, d2).length.should.equal(0);
  });

  it('should able to check the difference for two div', function () {
    var text1 = h('text', 'hello')
      , text2 = h('text', 'hello world')
      , p1 = h('p', { key: 1 }, [text1])
      , p2 = h('p', { key: 2 }, [text1])
      , p3 = h('p', { key: 2}, [text1])
      , p4 = h('p', { key: 1 }, [text2]);

    var res
      , a1 = h('div', { style: { color: '#000' } })
      , a2 = h('div', { style: { color: '#fff' } })
      , b1 = h('div', { style: { color: '#fff' } }, [h('p', null, [text1])])
      , b2 = h('div', { style: { color: '#fff' } }, [h('p', null, [text2])])
      , c1 = h('div', null, [p1])
      , c2 = h('div', null, [p2])
      , d1 = h('div', null, [p1, p2])
      , d2 = h('div', null, [p3, p4]);

    res = diff(a1, a2);
    res.length.should.equal(1);
    res[0].length.should.equal(1);
    res[0][0].operate.should.equal(OPERATE.PROPS);
    res[0][0].diff.style.color.should.equal('#fff');

    res = diff(b1, b2);
    res.length.should.equal(1);
    res[0].length.should.equal(1);
    res[0][0].operate.should.equal(OPERATE.REPLACE);
    res[0][0].from.should.equal(text1);
    res[0][0].to.should.equal(text2);

    res = diff(c1, c2);
    res.length.should.equal(2);
    res[0].length.should.equal(1);
    res[1].length.should.equal(1);
    res[0][0].operate.should.equal(OPERATE.INSERT);
    res[0][0].from.should.equal(p2);
    res[1][0].operate.should.equal(OPERATE.REMOVE);
    res[1][0].from.should.equal(p1);

    res = diff(d1, d2);
    res.length.should.equal(2);
    res[0].length.should.equal(1);
    res[1].length.should.equal(1);
    res[0][0].operate.should.equal(OPERATE.ORDER);
    res[0][0].to.should.eql({ removes: [{ from: 1, key: 2 }], inserts: [{ key: 2, to: 0 }] });
    res[1][0].from.should.equal(text1);
    res[1][0].to.should.equal(text2);
  });
});

describe('render', function () {
  it('should render a div which has a p in it', function () {
    var vd = h('div', { style: { backgroundColor: '#fff' } }, [h('p', null, [h('text', 'hello')])]);
    render(vd).should.equal('<div style="background-color: #fff;"><p>hello</p></div>')
  });

  it('should render a input has value', function () {
    var vd = h('input', { value: 'hello' });
    render(vd).should.equal('<input value="hello">');
  });

  it('should render a disabled input', function () {
    var vd = h('input', { disabled: '' });
    render(vd).should.equal('<input disabled>');
  });
});
