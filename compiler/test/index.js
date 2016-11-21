
const compile = require('..'),
  assert = require('assert')


// no parser
var tag = compile('<yo>{ title }</yo>', null, true)
assert.equal(tag.name, 'yo')
assert.equal(tag.html, '<yo>$0</yo>')
assert.equal(tag.fns[0], 'function(){return this.title}')

// custom parser
function myparser(src) { return src + 'bar' }
tag = compile('<yo><script>foo</script></yo>', { js: myparser }, true)
assert.equal(tag.script, 'foobar')


// sass
tag = compile(`
  <test>
    <style>
      a
        color: red
    </style>
  </test>
`, { css: 'sass' }, true)

assert.equal(tag.style, 'a { color: red; }\n')

// babel
tag = compile(`
  <yo>
    <script>
    var add = (a) => a
    </script>
  </yo>`, { js: '_es6' }, true)
// assert.equal(tag.script, 'add = function (a) { return a; }')

// buble
tag = compile(`
  <yo>
    <script>
    add = (a) => a
    </script>
  </yo>`, { js: 'buble' }, true)

assert.equal(tag.script, 'add = function (a) { return a; }')

// pug
tag = compile('yo { title }', { html: 'pug' }, true)
assert.equal(tag.html, '<yo>$0</yo>')


// combined
tag = compile(`
  test
    style.
      a
        color: red

    p { title }

    script.
      add = (a) => a

`, { html: 'pug', js: 'buble', css: 'sass' }, true)


assert.equal(tag.name, 'test')
assert.equal(tag.style, 'a { color: red; }\n')
assert.equal(tag.html, '<test><p>$0</p></test>')
assert.equal(tag.script, 'add = function (a) { return a; }')
