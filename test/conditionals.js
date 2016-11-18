
// commonly used variables
var $, tag

module.exports = function(test, assert) {

  // conditionals
  tag = test(`
    <test>
      <b if={ hide }>void</b>
      <inner if={ !hide }/>
      <script>
        this.counter = 0
      </script>
    </test>

    <inner>
      <h1>inner</h1>
      { parent.counter++ }
    </inner>
  `)


  $ = tag.find
  assert(!$('b'))
  assert.equal($('h1').text(), 'inner')
  assert.equal(tag.counter, 1)

  // hide -> don't execute expressions
  tag.update({ hide: true })
  assert.equal(tag.counter, 1)

  assert.equal($('b').text(), 'void')
  assert(!$('h1'))

  // show -> expressions work again
  tag.update({ hide: false })
  assert.equal(tag.counter, 2)

}