
/* Runs ${size} amount of tests for supplied tags */
function benchmark(size) {

  var self = { tags: [] }

  self.run = function() {
    if (!size) return

    console.info('Speed with ' + size + ' runs')

    var total = 0

    self.tags.forEach(function(tag) {
      var start = Date.now(),
        fn = tag.bench || tag.update,
        name = tag.name,
        spaces = ''.repeat ? ' '.repeat(20 - name.length) : '  '

      for (var i = 0; i < size; i++) fn()
      var time = Date.now() - start
      console.log('  ' + name + spaces + time + 'ms')
      total += time
    })

    console.info('Total ' + total + 'ms')
  }

  return self

}

if (typeof module == 'object') module.exports = benchmark