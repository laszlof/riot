
// commonly used variables
var $, tag

module.exports = function(test, assert) {

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


  // named yield
  tag = test(`
    <parent>
      <some-tag>
        <h1 name="title">{ title }</h1>
        <section name="body">
          <p>{ opts.body }</p>
        </section>
      </some-tag>
      <script>
        this.title = 'Title'
      </script>
    </parent>

    <some-tag>
      <header>
        <yield name="title"/>
      </header>
      <main>
        <yield name="body"/>
      </main>
    </some-tag>

  `, { body: 'Content' })

  tag.equals(`
    <some-tag>
      <header>
        <h1>Title</h1>
      </header>
      <main>
        <section>
          <p>Content</p>
        </section>
      </main>
    </some-tag>
  `)


  // yield with loops
  tag = test(`
    <parent>
      <child each={ item in items } item={ item }>
        <h2 onclick={ setTitle }>{ title }</h2>
        <p>p2</p>
      </child>
      <script>
        this.items = ['a', 'b']
        this.title = 'p1'

        setTitle() {
          this.title = 'changed'
        }
      </script>
    </parent>

    <child>
      <h1>i-{ opts.item }</h1>
      <yield/>
    </child>

  `)

  tag.equals(`
    <child>
      <h1>i-a</h1>
      <h2>p1</h2>
      <p>p2</p>
    </child>

    <child>
      <h1>i-b</h1>
      <h2>p1</h2>
      <p>p2</p>
    </child>
  `)

  // parent click
  $ = tag.find
  $('h2').trigger('click')
  assert.equal($('h2').text(), 'changed')



}