
suite.push(function(test, assert) {

  var $, tag

  // expressions
  tag = test('expressions', {
    body: '<b>a</b>',
    title: 'test'
  })

  $ = tag.find
  assert.equal($('expressions').attr('class'), 'a b')
  assert.equal($('h1').text(), 'TEST')
  assert.equal($('em').text(), 'a b c d')
  assert.equal($('div').innerHTML, '<b>a</b> b')
  assert.equal($('div').attr('id'), 'a test')

  // boolean attributes
  assert(!$('input').attributes[0])
  assert.strictEqual($('textarea').attr('disabled'), '')

  // try overriding update
  assert.throws(function() {
    tag.update = 1
  })


  // root attributes
  tag = test('root-attributes')



  $ = tag.find
  var el = $('inner')

  assert.equal($('root-attributes').attr('class'), 'a')
  assert.equal(el.attr('class'), 'a b z')
  assert.equal(el.attr('data-id'), 'test')
  assert.equal(el.attr('id'), 'zoo')


  // event listeners
  tag = test('event-listeners')

  el = tag.find('event-listeners')

  el.trigger('click')
  assert.equal(tag.counter, 1)

  el.trigger('mouseup')
  assert.equal(tag.counter, 4)
  assert.equal(tag.find('h1').text(), 'test')



  // tags & refs
  tag = test('tags-and-refs', { items: [1, 2] })

  assert.equal(tag.tags.child1.length, 4)
  assert.equal(typeof tag.tags.child2.update, 'function')

  assert.equal(tag.refs.b.length, 2)
  assert.equal(tag.refs.a.nodeType, 1)


})

suite.push(function(test, assert) {

  var $, tag

  // conditionals
  tag = test('if-attribute')

  $ = tag.find
  assert(!$('b'))
  assert.equal($('h1').text(), 'inner')
  assert.equal(tag.counter, 1)

  // hide -> don't execute expressions
  tag.update({ hide: true })
  assert.equal(tag.counter, 1)

  assert.equal($('b').text(), 'c1')
  assert(!$('h1'))

  // show -> expressions work again
  tag.update({ hide: false })
  assert.equal(tag.counter, 2)

  tag.bench = function() {
    tag.update({ hide: !tag.hide })
  }

})
suite.push(function(test, assert) {

  var $, tag, items

  // object loop
  tag = test('object-loop', {
    items: {
      a: { desc: 'desc1', arr: [0, 1, 2, 3] },
      b: { desc: 'desc2', arr: [4, 5, 6] },
      c: { desc: 'desc3', arr: [7, 8] },
    }
  })


  $ = tag.findAll
  assert.equal($('h1').length, 3)
  assert.equal($('h1')[0].text(), 'a')
  assert.equal($('p')[1].text(), 'desc2')
  assert.equal($('b').length, 9)
  assert.equal($('b')[4].text(), 'b4')

  tag.opts.items.c.arr.push(9)
  assert.equal($('b').length, 10)


  // loop manipulation
  tag = test('loop-edit', { items: [1, 2, 3] })


  $ = tag.findAll
  var els = $('h1')
  assert.equal(els.length, 3)
  assert.equal(els[0].text(), 1)
  assert.equal(els[1].text(), 2)

  els = $('h2')
  assert.equal(els.length, 3)
  assert.equal(els[0].text(), 2)
  assert.equal(els[1].text(), 4)

  // push
  items = tag.opts.items
  items.push(4)
  els = $('h1')
  assert.equal(els.length, 4)
  assert.equal(els[3].text(), 4)
  assert.equal($('h2').length, 4)

  // unshift
  items.unshift(-1)
  els = $('h1')
  assert.equal(els.length, 5)
  assert.equal(els[0].text(), -1)

  // sort desc
  items.sort(function(a, b) { return a < b ? 1 : -1 })
  els = $('h1')
  assert.equal(els[0].text(), 4)
  assert.equal(els[4].text(), -1)

  // splice
  items.splice(1, 2)
  els = $('h1')
  assert.equal(els.length, 3)
  assert.equal(els[1].text(), 1)

  // remove
  items.remove(1)
  els = $('h1')
  assert.equal(els.length, 2)
  assert.equal(els[1].text(), -1)


  // change array
  tag.opts.items = [10, 20, 30]
  tag.update()
  els = $('h2')
  assert.equal(els.length, 3)
  assert.equal(els[1].text(), 40)


  // nested loops
  tag = test('nested-loops', {
    items: [
      { el: 1, arr: [10, 10, 10] },
      { el: 2, arr: [20, 20, { value: 10, arr: [30, 40, 50] } ] },
      { el: 3 },
    ]
  })

  // 1st level
  $ = tag.findAll
  els = $('h1')
  assert.equal(els.length, 3)
  assert.equal(els[0].text(), 'v1')
  assert.equal(els[1].text(), 'v2')


  // 2nd level
  els = $('h2')
  assert.equal(els.length, 6)
  assert.equal(els[0].text(), '1-10')
  assert.equal(els[3].text(), '2-20')

  // 3rd level
  els = $('h3')
  assert.equal(els.length, 3)
  assert.equal(els[0].text(), '10-30')
  assert.equal(els[1].text(), '10-40')


  // nested loop manipulation
  items = tag.opts.items[1].arr
  items.unshift(99)
  els = $('h2')
  assert.equal(els.length, 7)
  assert.equal(els[3].text(), '2-99')


  // push complex item
  items.push({ el: 5, arr: [ 3, 4 ]})
  assert.equal($('h2').length, 8)
  assert.equal($('h3').length, 5)


  tag.bench = function() {
    var items = tag.opts.items
    items.push({ el: 4 })
    items.pop()
    items.push({ el: 5, arr: [ 3, 4 ]})
    items.pop()
  }

  // custom tag loops
  tag = test('tag-loop', {
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

  tag.opts.items.push({ title: 'x', arr: [{ title: 'y' }, { title: 'z' }] })
  assert.equal($('deep-nested').length, 4)


  // bench
  tag.bench = function() {
    items = tag.opts.items
    items.push({ title: 'x', arr: [{ title: 'y' }, { title: 'z' }] })
    items.pop()
  }

  // table
  tag = test('table-rows', {
    rows: ['one', 'two', 'three']
  })

  els = tag.findAll('th')
  assert.equal(els.length, 3)


  // cleanup test
  tag = test('loop-cleanup', {
    items: [1, 2],
    counter: 0
  })

  var opts = tag.opts

  assert.equal(opts.counter, 2)
  tag.update()
  assert.equal(opts.counter, 4)
  opts.items.remove(1)
  tag.update()
  assert.equal(opts.counter, 5)

})
suite.push(function(test, assert) {

  var $, tag

  // yield
  tag = test('yield-test', { val: 'v1' })

  $ = tag.find
  assert.equal($('h1').text(), 'childgirl')
  assert.equal($('h2').text(), 'test')
  assert.equal($('span').text(), 'v1')
  assert.equal(tag.findAll('b').length, 3)
  assert(!$('yield'))

  tag.update({ title: 'old' })
  assert.equal($('h2').text(), 'old')


  // named yield
  tag = test('named-yield', { body: 'Content' })

  tag.equals('\
    <some-tag>\
      <header>\
        <h1>Title</h1>\
      </header>\
      <main>\
        <section>\
          <p>Content</p>\
        </section>\
      </main>\
    </some-tag>\
  ')


  // yield with loops
  tag = test('yield-loop')

  tag.equals(
    '<child> <h1>i-a</h1> <h2>p1</h2> <p>p2</p> </child>' +
    '<child> <h1>i-b</h1> <h2>p1</h2> <p>p2</p> </child>'
  )

  // parent click
  $ = tag.find
  $('h2').trigger('click')
  assert.equal($('h2').text(), 'changed')


  tag.bench = function() {
    tag.items.push('x')
    tag.items.splice(0, 1)
  }

}
)
suite.run()