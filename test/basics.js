
// commonly used variables
var $, tag

module.exports = function(test, assert) {


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


  // try overriding update
  assert.throws(function() {
    tag.update = 1
  })


  // root attributes
  tag = test(`
    <test class={ a: true }>
      <inner class="z" id="zoo" baz="goo"/>
    </test>

    <inner class="{ a: 1, b: 1 } { opts.class }" id={ opts.id || id } data-id={ id }>
      <h1>Title</h1>
      <script>
        this.id = 'test'
      </script>
    </inner>
  `)



  $ = tag.find
  var el = $('inner')

  assert.equal($('test').attr('class'), 'a')
  assert.equal(el.attr('class'), 'a b z')
  assert.equal(el.attr('data-id'), 'test')
  assert.equal(el.attr('id'), 'zoo')


  // event listeners
  tag = test(`
    <test onclick={ incr } onmouseup={ add(counter + 2, 'test') }>
      <h1>{ title }</h1>

      <script>
        this.counter = 0

        incr() {
          this.counter++
        }

        add(am, title) {
          this.title = title
          this.counter += am
        }
      </script>

    </test>
  `)

  el = tag.find('test')
  el.trigger('click')
  assert.equal(tag.counter, 1)

  el.trigger('mouseup')
  assert.equal(tag.counter, 4)
  assert.equal(tag.find('h1').text(), 'test')



  // tags & refs
  tag = test(`
    <base-tag>
      <child1 name="a"/>
      <child1 id="b"/>
      <child1 each={ el in opts.items }/>
      <child2 name="b"/>
    </base-tag>

    <child1></child1>,
    <child2></child2>

  `, { items: [1, 2] })

  assert.equal(tag.tags.child1.length, 4)
  assert.equal(typeof tag.tags.child2.update, 'function')

  assert.equal(tag.refs.b.length, 2)
  assert.equal(tag.refs.a.nodeType, 1)


  // yield
  tag = test(`
    <parent>
      <child id="girl">
        <h2>{ title }</h2>
        <span>{ opts.val }</span>
        <b each={ num in arr }>n{ num }</b>
      </child>
      <script>
        this.title = 'test'
        this.arr = [1, 2, 3]
      </script>
    </parent>

    <child>
      <h1>{ title }{ opts.id }</h1>
      <yield/>
      <script>
        this.title = 'child'
      </script>
    </child>

  `, { val: 'v1' })

  $ = tag.find
  assert.equal($('h1').text(), 'childgirl')
  assert.equal($('h2').text(), 'test')
  assert.equal($('span').text(), 'v1')
  assert.equal(tag.findAll('b').length, 3)
  assert(!$('yield'))

  tag.update({ title: 'old' })
  assert.equal($('h2').text(), 'old')

}