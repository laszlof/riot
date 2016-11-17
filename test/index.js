
const test = require('./lib/tag-test'),
  assert = require('assert')


var $ = test({ title: 'test', body: 'a <b>b</b>' }, `
  <test>
    <em>a { b: true, c: true } d</em>
    <p class={ a: 1, b: true, c: false }>{ opts.title }</p>
    <div>{{ opts.body }}</div>
  </test>
`)


assert.equal($('p').text(), 'test')
assert.equal($('p').attr('class'), 'a b')
assert.equal($('em').text(), 'a b c d')
assert.equal($('div').html(), 'a <b>b</b>')

