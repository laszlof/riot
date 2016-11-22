
module.exports = function(test, assert) {

  var $, tag, items

  // object loop
  tag = test(`
    <object-loop>
      <div each={ key, obj in opts.items }>
        <h1>{ key }</h1>
        <p>{ obj.desc }</p>
        <b each={ el in obj.arr }>b{ el }</b>
      </div>
    </object-loop>

  `, {
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
  tag = test(`
    <loop-edit>
      <div each={ item in opts.items }>
        <h1>{ item }</h1>
      </div>
      <div each={ item in opts.items }>
        <h2>{ item * 2 }</h2>
      </div>
    </loop-edit>

  `, { items: [1, 2, 3] })


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

  tag.opts.items.push({ title: 'x', arr: [{ title: 'y' }, { title: 'z' }] })
  assert.equal($('deep-nested').length, 4)


  // bench
  tag.bench = function() {
    items = tag.opts.items
    items.push({ title: 'x', arr: [{ title: 'y' }, { title: 'z' }] })
    items.pop()
  }

  // table
  tag = test(`
    <table-rows>
      <table>
        <tr> <th each={ cell in opts.rows }>{ cell }</th></tr>
      </table>
    </table-rows>
  `, {
    rows: ['one', 'two', 'three']
  })

  els = tag.findAll('th')
  assert.equal(els.length, 3)


  // cleanup test
  tag = test(`
    <loop-cleanup>
      <div each={ item in opts.items }>{ opts.counter++ }</div>
    </loop-cleanup>

  `, {
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

}