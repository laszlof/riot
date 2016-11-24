
module.exports = function(test, assert) {

  var $, tag

  // expressions
  tag = test(`
    <expressions class={ a: 1, b: true, c: false } id="test">
      <h1>{ upper(title) }</h1>
      <em>a { b: true, c: true } d</em>
      <input checked={ false }>
      <textarea disabled={ null }></textarea>
      <section id="a { opts.title }">{{ opts.body }} b</section>

      <script>
        this.title = opts.title

        upper(str) {
          return str.toUpperCase()
        }
      </script>
    </expressions>
  `, {
    body: '<b>a</b>',
    title: 'test'
  })

  $ = tag.find
  assert.equal(tag.root.attr('class'), 'a b')
  assert.equal(tag.root.attr('id'), 'test')
  assert.equal($('h1').text(), 'TEST')
  assert.equal($('em').text(), 'a b c d')
  assert.equal($('section').innerHTML, '<b>a</b> b')
  assert.equal($('section').attr('id'), 'a test')

  // boolean attributes
  assert(!$('input').attributes[0])
  assert.strictEqual($('textarea').attr('disabled'), '')

  // try overriding update
  assert.throws(function() {
    tag.update = 1
  })


  // root attributes
  tag = test(`
    <root-attributes type={ a: true }>
      <inner type="z" id="zoo" baz="goo"/>
    </root-attributes>

    <inner class="{ a: 1, b: 1 } { opts.type }" id={ opts.id || id } data-id={ id }>
      <h1>Title</h1>
      <script>
        this.id = 'test'
      </script>
    </inner>
  `)



  $ = tag.find
  var el = $('inner')

  assert.equal(tag.root.attr('type'), 'a')
  assert.equal(el.attr('class'), 'a b z')
  assert.equal(el.attr('data-id'), 'test')
  assert.equal(el.attr('id'), 'zoo')


  // event listeners
  tag = test(`
    <event-listeners>

      <section onclick={ incr } onmouseup={ add(counter + 2, 'test') }>
        <h1>{ title }</h1>
      </section>

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

    </event-listeners>
  `)

  el = tag.find('section')

  el.trigger('click')
  assert.equal(tag.counter, 1)

  el.trigger('mouseup')
  assert.equal(tag.counter, 4)
  assert.equal(tag.find('h1').text(), 'test')



  // tags & refs
  tag = test(`
    <tags-and-refs>
      <child1 name="a"/>
      <child1 id="b"/>
      <child1 each={ el in opts.items }/>
      <child2 name="b"/>
    </tags-and-refs>

    <child1></child1>,
    <child2></child2>

  `, { items: [1, 2] })



  assert.equal(tag.tags.child1.length, 4)
  assert.equal(typeof tag.tags.child2.update, 'function')

  assert.equal(tag.refs.b.length, 2)
  assert.equal(tag.refs.a.nodeType, 1)


}