

const test = require('./lib/tag-test'),
  assert = require('assert'),
  start = Date.now()


// commonly used variables
var $, tag, items


// expressions
tag = test(`
  <test class={ a: 1, b: true, c: false }>
    <h1>{ upper(title) }</h1>
    <em>a { b: true, c: true } d</em>
    <input checked={ false }>
    <textarea disabled={ null }></textarea>
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

// boolean attributes
assert(!$('input').attributes[0])
assert.strictEqual($('textarea').attr('disabled'), '')


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
items = tag.opts.items
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
  <nested-loops>
    <div each={ item in opts.items }>
      <h1>v{ item.el }</h1>

      <div each={ second in item.arr }>
        <h2>{ item.el }-{ second }</h2>

        <div each={ third in second.arr }>
          <h3>{ second.value }-{ third }</h3>
        </div>

      </div>

    </div>
  </nested-loops>
`, {
  items: [
    { el: 1, arr: [10, 10, 10] },
    { el: 2, arr: [20, 20, { value: 10, arr: [30, 40, 50] } ] },
    { el: 3 },
  ]
})

// 1st level
els = tag.findAll('h1')
assert.equal(els.length, 3)
assert.equal(els[0].text(), 'v1')
assert.equal(els[1].text(), 'v2')

// 2nd level
els = tag.findAll('h2')
assert.equal(els.length, 6)
assert.equal(els[0].text(), '1-10')
assert.equal(els[3].text(), '2-20')

// 3rd level
els = tag.findAll('h3')
assert.equal(els.length, 3)
assert.equal(els[0].text(), '10-30')
assert.equal(els[1].text(), '10-40')


// nested loop manipulation
items = tag.opts.items[1].arr
items.unshift(99)
els = tag.findAll('h2')
assert.equal(els.length, 7)
assert.equal(els[3].text(), '2-99')



// custom tag loops
tag = test(`
  <tag-loop>
    <looped-tag each={ item in opts.items } item={ item }/>
  </tag-loop>

  <looped-tag>
    <h2>{ opts.item.title }</h2>
    <deep-nested each={ item in opts.item.arr } item={ item }/>
  </looped-tag>

  <deep-nested>
    <h3>{ opts.item.title }</h3>
  </deep-nested>
`, {
  items: [
    { title: 't1', arr: [{ title: 'd1' }, { title: 'd2' }] },
    { title: 't2' },
    { title: 't3' }
  ]
})


$ = tag.findAll
els = $('h2')
assert.equal(els.length, 3)
assert.equal(els[0].text(), 't1')

els = $('h3')
assert.equal(els.length, 2)
assert.equal(els[0].text(), 'd1')


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


