
module.exports = function(test, assert) {

  var $, tag, el

  // parent option passing
  tag = test(`
    <option-passing>
      <child-data data={ data } zap={ a } foo="bar"/>
      <script>
        this.a = 'lad'
        this.data = { a: 10 }
      </script>
    </option-passing>

    <child-data>
      <h1>{ opts.data.a } { opts.foo } { opts.zap } { b }</h1>
      <script>
        this.b = opts.a + opts.zap
      </script>
    </child-data>
  `)


  el = tag.find('h1')
  return console.info(el.text())

  assert.equal(el.text(), '10 bar lad')

  tag.update({ a: 'boy', data: { a: 101 } })
  assert.equal(el.text(), '101 bar boy')


}