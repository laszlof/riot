riot.tag('if-attribute', '<if-attribute> <b if="$0">$1</b> <inner-tag if="$2"></inner-tag> </if-attribute>', 
[function(){return this.hide},
function(){return ["c", this.counter]},
function(){return !this.hide}], 

function(self, opts) {
this.counter = 0
}
);riot.tag('inner-tag', '<inner-tag> <h1>inner</h1>$0</inner-tag>', 
[function(){return this.parent.counter++}], '');

riot.tag('expressions', '<expressions class="$0"> <h1>$1</h1> <em>$2</em> <input checked="$3"> <textarea disabled="$4"></textarea> <div id="$5">$6</div> </expressions>', 
[function(){return { a: 1, b: true, c: false }},
function(){return this.upper(this.title)},
function(){return ["a ",{ b: true, c: true }," d"]},
function(){return false},
function(){return null},
function(){return ["a ", this.opts.title ]},
function(){return [{ _html:  this.opts.body  }," b"]}], 

function(self, opts) {
this.title = opts.title

    this.upper = function(str) {
      return str.toUpperCase()
    }.bind(this)
}
);

riot.tag('root-attributes', '<root-attributes type="$0"> <inner type="z" id="zoo" baz="goo"></inner></root-attributes>', 
[function(){return { a: true }}], '');riot.tag('inner', '<inner class="$0" id="$1" data-id="$2"> <h1>Title</h1> </inner>', 
[function(){return [{ a: 1, b: 1 }," ", this.opts.type ]},
function(){return this.opts.id || this.id},
function(){return this.id}], 

function(self, opts) {
this.id = 'test'
}
);

riot.tag('event-listeners', '<event-listeners onclick="$0" onmouseup="$1"> <h1>$2</h1> </event-listeners>', 
[function(){return this.incr},
function(e) { return function(e) { return this.add(this.counter+ 2, 'test', e) } },
function(){return this.title}], 

function(self, opts) {
this.counter = 0

    this.incr = function() {
      this.counter++
    }.bind(this)

    this.add = function(am, title) {
      this.title = title
      this.counter += am
    }.bind(this)
}
);

riot.tag('tags-and-refs', '<tags-and-refs> <child1 name="a"></child1> <child1 id="b"></child1> <child1 each="$0"></child1> <child2 name="b"></child2></tags-and-refs>', 
[function(){return this.opts.items}], '');riot.tag('child1', '<child1></child1>', 
[], '');riot.tag('child2', '<child2></child2>', 
[], '');

riot.tag('yield-test', '<yield-test> <yielded id="girl"> <h2>$0</h2> <span>$1</span> <b each="$2">$3</b> </yielded> </yield-test>', 
[function(){return this.title},
function(){return this.opts.val},
function(){return this.arr},
function(num, i){return ["n", num ]}], 

function(self, opts) {
this.title = 'test'
    this.arr = [1, 2, 3]
}
);riot.tag('yielded', '<yielded> <h1>$0</h1> <yield></yield> </yielded>', 
[function(){return [ this.title, this.opts.id ]}], 

function(self, opts) {
this.title = 'child'
}
);

riot.tag('named-yield', '<named-yield> <some-tag> <h1 name="title">$0</h1> <section name="body"> <p>$1</p> </section> </some-tag> </named-yield>', 
[function(){return this.title},
function(){return this.opts.body}], 

function(self, opts) {
this.title = 'Title'
}
);riot.tag('some-tag', '<some-tag> <header> <yield name="title"></yield> </header> <main> <yield name="body"></yield> </main></some-tag>', 
[], '');

riot.tag('yield-loop', '<yield-loop> <child each="$0" item="$1"> <h2 onclick="$2">$3</h2> <p>p2</p> </child> </yield-loop>', 
[function(){return this.items},
function(item, i){return item},
function(item, i){return this.setTitle},
function(item, i){return this.title}], 

function(self, opts) {
this.items = ['a', 'b']
    this.title = 'p1'

    this.setTitle = function() {
      this.title = 'changed'
    }.bind(this)
}
);riot.tag('child', '<child> <h1>$0</h1> <yield></yield></child>', 
[function(){return ["i-", this.opts.item ]}], '');

riot.tag('object-loop', '<object-loop> <div each="$0"> <h1>$1</h1> <p>$2</p> <b each="$3">$4</b> </div></object-loop>', 
[function(){return this.opts.items},
function(key, obj){return key},
function(key, obj){return obj.desc},
function(key, obj){return obj.arr},
function(key, obj,el, i){return ["b", el ]}], '');

riot.tag('loop-edit', '<loop-edit> <div each="$0"> <h1>$1</h1> </div> <div each="$2"> <h2>$3</h2> </div></loop-edit>', 
[function(){return this.opts.items},
function(item, i){return item},
function(item, i){return this.opts.items},
function(item, i){return item * 2}], '');

riot.tag('nested-loops', '<nested-loops> <div each="$0"> <h1>$1</h1> <div each="$2"> <h2>$3</h2> <div each="$4"> <h3>$5</h3> </div> </div> </div></nested-loops>', 
[function(){return this.opts.items},
function(item, i){return ["v", item.el ]},
function(item, i){return item.arr},
function(item, i,second, i){return [ item.el ,"-", second ]},
function(item, i,second, i){return second.arr},
function(item, i,second, i,third, i){return [ second.value ,"-", third ]}], '');

riot.tag('tag-loop', '<tag-loop> <looped-tag each="$0" item="$1"></looped-tag></tag-loop>', 
[function(){return this.opts.items},
function(item, i){return item}], '');riot.tag('looped-tag', '<looped-tag> <h2>$0</h2> <deep-nested each="$1" item="$2"></deep-nested></looped-tag>', 
[function(){return this.opts.item.title},
function(){return this.opts.item.arr},
function(item, i){return item}], '');riot.tag('deep-nested', '<deep-nested> <h3>$0</h3></deep-nested>', 
[function(){return this.opts.item.title}], '');

riot.tag('table-rows', '<table-rows> <table> <tr> <th each="$0">$1</th></tr> </table></table-rows>', 
[function(){return this.opts.rows},
function(cell, i){return cell}], '');

riot.tag('loop-cleanup', '<loop-cleanup> <div each="$0">$1</div></loop-cleanup>', 
[function(){return this.opts.items},
function(item, i){return this.opts.counter++}], '');