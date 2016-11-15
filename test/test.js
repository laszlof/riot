riot.tag('test-tag', '<test-tag> <div each="$0" onclick="$1"> <h3>$2</h3> <b each="$3" class="tag">$4</b> </div> </test-tag>',

[function(){return this.threads},
function(thread){return this.remove},
function(thread){return thread.title},
function(thread){return thread.tags},
function(tag){return tag}],

function(self, opts) {
	var items = this.threads = [
      { title: 'Firsti', date: 20928, tags: ['cat', 'doggi', 'animal'] },
      { title: 'Second', date: 20928, tags: ['cat', 'snake', 'lizard'] },
      { title: 'Thirdi', date: 20928, tags: ['dog', 'drug'] }
    ]
    this.title = 'This is a title'

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
})