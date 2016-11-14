riot.tag('test-tag', '<test-tag> <h2 class="$0" onclick="$1">$2</h2> <p if="$3">This is a desc</p> <section each="$4" onclick="$5"> <h3>$6</h3> <time onclick="$7">$8</time> </section> <button onclick="$9" if="$3">Push</button> <foo each="$4" onclick="$5"></foo> </test-tag>', [
function(){return { thin: this.thin}},
function(){return this.toggle},
function(){return this.format(this.title)},
function(){return !this.hide},
function(){return this.threads},
function(thread){return this.remove},
function(thread){return [ this.title," / ", thread.title ]},
function(e, thread) { return this.setState(thread.title, e, thread) },
function(thread){return thread.date},
function(){return this.add}],
function(self, opts) { var items = this.threads = [
      { title: 'Firsti', date: 20928 },
      { title: 'Second', date: 20928 },
      { title: 'Thirdi', date: 20928 }
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
    }.bind(this) })