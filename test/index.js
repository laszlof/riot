

const test = require('./lib/tag-test'),
  assert = require('assert'),
  start = Date.now()

var $, tag



// expressions
tag = test(`
  <test class={ a: 1, b: true, c: false }>
    <h1>{ upper(title) }</h1>
    <em>a { b: true, c: true } d</em>
    <div id="a { opts.title }">{{ opts.body }} b</div>

    <script>
      this.title = opts.title

      upper(str) {
        return str.toUpperCase()
      }
    </script>
  </test>
`, { 
  body: '<b>a</b>',
  title: 'test'
})

$ = tag.find
assert.equal($('test').attr('class'), 'a b')
assert.equal($('h1').text(), 'TEST')
assert.equal($('em').text(), 'a b c d')
assert.equal($('div').html(), '<b>a</b> b')
assert.equal($('div').attr('id'), 'a test')


// root attributes
tag = test(`
  <test>
    <inner class="z" id="zoo"/>
  </test>

  <inner class="{ a: 1, b: 1 } { opts.class }" id={ opts.id || id } data-id={ id }>
    <h1>Title</h1>
    <script>
      this.id = 'test'
    </script>
  </inner>
`)

var el = tag.find('inner')
assert.equal(el.attr('class'), 'a b z')
assert.equal(el.attr('data-id'), 'test')
assert.equal(el.attr('id'), 'zoo')



// conditionals
tag = test(`
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
tag = test(`
  <test>
    <b each={ item in opts.items }>{ item }</b>
    <span each={ item in opts.items }>{ item * 2 }</span>
  </test>

`, { items: [1, 2, 3] })

$ = tag.findAll
var els = $('b')
assert.equal(els.length, 3)
assert.equal(els[0].text(), 1)
assert.equal(els[1].text(), 2)

els = $('span')
assert.equal(els.length, 3)
assert.equal(els[0].text(), 2)
assert.equal(els[1].text(), 4)

// push
var items = tag.opts.items
items.push(4)
els = $('b')
assert.equal(els.length, 4)
assert.equal(els[3].text(), 4)
assert.equal($('span').length, 4)

// unshift
items.unshift(-1)
els = $('b')
assert.equal(els.length, 5)
assert.equal(els[0].text(), -1)

// sort desc
items.sort(function(a, b) { return a < b })
els = $('b')
assert.equal(els[0].text(), 4)
assert.equal(els[4].text(), -1)

// splice
items.splice(1, 2)
els = $('b')
assert.equal(els.length, 3)
assert.equal(els[1].text(), 1)

// remove
items.remove(1)
els = $('b')
assert.equal(els.length, 2)
assert.equal(els[1].text(), -1)


// change array
tag.opts.items = [10, 20, 30]
tag.update()
els = $('span')
assert.equal(els.length, 3)
assert.equal(els[1].text(), 40)



// nested loops
tag = test(`
  <test>
    <div each={ item in opts.items }>
      <h3>{ item.title }</h3>
      <b each={ num in item.arr }>{ num }</b>
    </div>
  </test>
`, {
  items: [
    { title: '1st', arr: [1, 1, 1] },
    { title: '2nd', arr: [2, 2, 2] },
    { title: '3rd', arr: [3, 3, 3] },
  ]
})

els = tag.findAll('h3')
assert.equal(els.length, 3)
assert.equal(els[0].text(), '1st')
assert.equal(els[1].text(), '2nd')

els = tag.findAll('b')
assert.equal(els.length, 9)
assert.equal(els[0].text(), 1)
assert.equal(els[3].text(), 2)
assert.equal(els[6].text(), 3)


// table
tag = test(`
  <test>
    <table>
      <tr> <th each={ cell in opts.rows }>{ cell }</th></tr>
    </table>
  </test>
`, {
  rows: ['one', 'two', 'three']
})

els = tag.findAll('th')
assert.equal(els.length, 3)

console.info(`All passed in ${Date.now() - start}ms`)
