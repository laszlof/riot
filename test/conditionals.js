
// commonly used variables
var $, tag

module.exports = function(test, assert) {

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

}