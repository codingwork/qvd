qvd
====

> 简化版Virtual DOM，用于Mobile页面渲染。

> 10.57 kB (源文件) → 2.6 kB (uglify) → 1.18 kB (gzip)

### Example

```javascript
var h = require('qvd').h
  , diff = require('qvd').diff;

var a = h('div', { style: { textAlign: 'center' }, [h('text', 'hello')] })
  , b = h('div', { style: { borer: '1px' } });

diff(a, b);
```

### API

```javascript
/**
 * h(tagName, properties, children)
 * 创建一个节点
 * @param {String} tagName tag名
 * @param {Object} properties 属性对象
 * @param {Array} children 子节点数组
 */
h('div', { style: { border: '1px' } }, [h('p')]);
```

```javascript
/**
 * h('text', text)
 * 创建文字节点
 * @param {String} text 文字节点内容
 */
h('text', 'hello world');
```

```javasript
/**
 * diff(a, b)
 * @param {VD} a 目前状态的a虚拟节点
 * @param {VD} b 要变成状态的b虚拟节点
 */
diff(a, b);
```

### License

Copyright (c) 2014 Matt-Esch.

Copyright (c) 2015 Daniel Yang.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
