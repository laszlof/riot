riot.tag('inner', '<inner> <h3>$0</h3> <p>Descrip</p> </inner>',

[function(){return Math.random()}],

function(self, opts) {
	console.info('INITIALIZED')
})
riot.tag('test-tag', '<test-tag> <h2 class="$0" onclick="$1">$2</h2> <inner each="$3"></inner> <hr> <p if="$4">This is a desc, but <b>$5</b></p> </test-tag>',

[function(){return { thin: this.thin}},
function(){return this.toggle},
function(){return this.format(this.title)},
function(){return this.threads},
function(){return !this.hide},
function(thread){return this.title}],

function(self, opts) {
	var items = this.threads = [
      { title: 'Firsti', date: 20928, tags: ['cat', 'doggi', 'animal'] },
      { title: 'Second', date: 20928, tags: ['cat', 'snake', 'lizard'] },
      { title: 'Thirdi', date: 20928, tags: ['dog', 'drug'] }
    ]
    this.title = 'This is a title'
    this.hide = true

    this.format = function(title) {
      return title.toUpperCase()
    }.bind(this)

    this.toggle = function() {
      if (items[2]) items = this.threads = [1, 2]
      this.thin = !this.thin
      this.hide = !this.hide
    }.bind(this)

    this.setState = function() {
      console.info(arguments)
    }.bind(this)

    this.add = function() {
      items.unshift({ title: 'Added', date: Math.random() })
    }.bind(this)

    this.remove = function(e, item) {
      items.remove(item)
    }.bind(this)

    this.removeTag = function(e, item) {
      console.info(arguments)
    }.bind(this)
})
