
// commonly used variables
var $, tag

module.exports = function(test, assert) {

  // basic expressions
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

}