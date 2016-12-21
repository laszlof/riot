
module.exports = function(test, assert) {

  var $, tag, el

  // parent option passing
  tag = test(`
    <option-passing>
      <child-data data={ data }/>
      <script>
        this.data = 100 + 190
      </script>
    </option-passing>

    <child-data>
      <script>
        console.info('RET', opts.data)
      </script>
    </child-data>
  `)


  el = tag.find('h1')
  return
  assert.equal(el.text(), '10 bar lad')

  tag.update({ a: 'boy', data: { a: 101 } })
  assert.equal(el.text(), '101 bar boy')


}