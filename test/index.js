
const test = require('./lib/tag-test'),
  assert = require('assert')


// expressions
var $, tag = test({ title: 'test', body: '<b>a</b>' }, `
  <test>
    <em>a { b: true, c: true } d</em>
    <p class={ a: 1, b: true, c: false }>{ opts.title }</p>
    <div id="a { opts.title }"">{{ opts.body }} b</div>
  </test>
`)

$ = tag.find
assert.equal($('p').text(), 'test')
assert.equal($('p').attr('class'), 'a b')
assert.equal($('em').text(), 'a b c d')
assert.equal($('div').html(), '<b>a</b> b')
assert.equal($('div').attr('id'), 'a test')


// conditionals
tag = test({}, `
  <test>
    <b if={ flag }>void</b>
    <inner if={ !flag }/>
  </test>

  <inner>
    <h1>inner</h1>
  </inner>
`)

$ = tag.find
assert(!$('b'))
assert.equal($('h1').text(), 'inner')

tag.update({ flag: true })
assert.equal($('b').text(), 'void')
assert(!$('h1'))


// simple loops
tag = test({ items: [1, 2, 3] }, `
  <test>
    <b each={ item in opts.items }>{ item }</b>
    <span each={ item in opts.items }>{ item * 2 }</span>
  </test>
`)

var els = tag.findAll('b')
assert.equal(els.length, 3)
assert.equal(els[0].text(), 1)
assert.equal(els[1].text(), 2)

els = tag.findAll('span')
assert.equal(els.length, 3)
assert.equal(els[0].text(), 2)
assert.equal(els[1].text(), 4)

