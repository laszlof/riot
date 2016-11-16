riot.tag('inner', '<inner> <h3>$0</h3> </inner>',

[function(){return this.Math.random()}],

function(self, opts) {
	console.info('INITIALIZED')
})

  console.info('outer script')
riot.tag('test-tag', '<test-tag> <h2 class="$0" onclick="$1">$2</h2> <div if="$3"> This is a desc, but <b>$4</b> <div each="$5"> <h3 onclick="$6">$7</h3> <b each="$8" class="tag" onclick="$9">$10</b> </div> </div> </test-tag>',

[function(){return { thin: this.thin}},
function(){return this.toggle},
function(){return this.format(this.title)},
function(){return !this.hide},
function(){return console.info('here') || this.title},
function(){return this.threads},
function(thread){return this.remove},
function(thread){return thread.title},
function(thread){return thread.tags},
function(e, tag) { return this.removeTag(this.thread, e, tag) },
function(tag){return tag}],

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
