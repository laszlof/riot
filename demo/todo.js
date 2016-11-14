riot.tag('todo', '<todo> <h2>$0</h2> <form onsubmit="$1"> <input type="text" autofocus placeholder="Example: buy bread"> <button>$2</button> </form> <p each="$3">$4<a onclick="$5" title="Remove task">×</a> </p> </todo>',

[function(){return this.title},
function(){return this.add},
function(){return ["Add ", this.getLabel(this.items.length) ," task"]},
function(){return this.items},
function(item){return item},
function(item){return this.remove}],

function(self, opts) {
	this.items = opts.items || []
    this.title = opts.title

    this.getLabel = function(am) {
      return ['first', 'second', 'third', 'fourth'][am] || 'a'
    }.bind(this)

    this.add = function(e) {
      e.preventDefault()
      var input = e.target[0]
      if (input.value) {
        this.items.unshift(input.value)
        input.value = ''
      }
    }.bind(this)

    this.remove = function(e, item) {
      this.items.remove(item)
    }.bind(this)
})