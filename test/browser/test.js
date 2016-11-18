riot.tag('test-tag', '<test-tag> <input type="checkbox" checked="$0"> </test-tag>',

[function(){return !this.flag}],

function(self, opts) {
	setTimeout(function() {
      self.update({ flag: 1 })
    }, 500)
})
riot.tag('test-attr', '<test-attr class="$0" data-test="bar"> <h3>$1</h3></test-attr>',

[function(){return ["something ", this.opts.class + 'joo' ," ", this.opts.class ]},
function(){return ["Child ", this.opts.class ]}],

function(self, opts) {
	
})
riot.tag('test-form', '<test-form> <textarea>$0</textarea> <input value="$0"> </test-form>',

[function(){return this.val}],

function(self, opts) {
	this.val = 'This is value'
})
riot.tag('test-image', '<test-image> <img src="$0"> </test-image>',

[function(){return this.src}],

function(self, opts) {
	this.set = function() {
      this.update({ src: 'riot.png' })
    }.bind(this)
    setTimeout(this.set, 1000)
})
riot.tag('test-table', '<test-table> <table border="1"> <tr><th each="$0">$1</th></tr> <tr><td each="$0">$1</td></tr> </table> <table border="1"> <tr each="$0"> <td>$1</td> <td>$2</td> </tr> </table> </test-table>',

[function(){return this.rows},
function(cell){return cell},
function(cell){return [ cell ," another"]}],

function(self, opts) {
	this.rows = ['one', 'two', 'three']
})
riot.tag('test-svg', '<test-svg> <svg> <circle each="$0" cx="$1" cy="$2" r="20" fill="black"></circle> </svg> <svg> <rect x="10" y="10" width="100" height="100"></rect> </svg> </test-svg>',

[function(){return this.points},
function(p){return p.x * 10 + 5},
function(p){return p.y * 10 + 5}],

function(self, opts) {
	this.points = [{'x': 1,'y': 0}, {'x': 9, 'y': 6}, {'x': 4, 'y': 7}]
})
