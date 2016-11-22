

module.exports = function(test, assert) {

  var $, tag

  // conditionals
  tag = test(`
    <if-attribute>
      <b if={ hide }>c{ counter }</b>
      <inner-tag if={ !hide }/>
      <script>
        this.counter = 0
      </script>
    </if-attribute>

    <inner-tag>
      <h1>inner</h1>
      { parent.counter++ }
    </inner-tag>
  `)

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

}