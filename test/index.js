
const riot = require('./node-riot'),
  dom = require('../compiler/dom'),
  assert = require('assert')


function test(tag_name, data) {
  const tag = riot.mount(tag_name, null, data)

  return function(query) {
    return dom.find(tag.root, query)
  }
}

var $ = test('expr', { title: 'test', body: 'a <b>b</b>' })

assert.equal($('p').text(), 'test', 'opts.title')
assert.equal($('p').attr('class'), 'a b', 'obj class')
assert.equal($('em').text(), 'a b c d', 'body obj')
// assert.equal($('div').html(), 'a <b>b</b>')

