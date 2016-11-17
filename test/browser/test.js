riot.tag('test-tag', '<test-tag> <img src="$0"> <textarea>$1</textarea> <input value="$1"> <svg> <circle each="$2" cx="$3" cy="$4" r="20" fill="black"></circle> </svg> </test-tag>',

[function(){return this.src},
function(){return this.val},
function(){return this.points},
function(p){return p.x * 10 + 5},
function(p){return p.y * 10 + 5}],

function(self, opts) {
	this.points = [{'x': 1,'y': 0}, {'x': 9, 'y': 6}, {'x': 4, 'y': 7}]
    this.val = 'This is value'

    this.set = function() {
      this.update({
        src: '//d13yacurqjgara.cloudfront.net/users/4664/screenshots/3101365/cocx_crop_1x.jpg',
        val: 'New value'
      })
    }.bind(this)

    setTimeout(this.set, 1000)
})
