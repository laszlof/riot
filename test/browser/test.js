riot.tag('test-tag', '<test-tag> <table border="1"> <tr><th each="$0">$1</th></tr> <tr><td each="$0">$1</td></tr> </table> <table border="1"> <tr each="$0"> <td>$1</td> <td>$2</td> </tr> </table> </test-tag>',

[function(){return this.rows},
function(cell){return cell},
function(cell){return [ cell ," another"]}],

function(self, opts) {
	this.rows = ['one', 'two', 'three']

    this.points = [{'x': 1,'y': 0}, {'x': 9, 'y': 6}, {'x': 4, 'y': 7}]
    this.val = 'This is value'

    this.set = function() {
      this.update({
         
        val: 'New value'
      })
    }.bind(this)

    setTimeout(this.set, 1000)
})
