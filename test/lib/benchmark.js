
module.exports = function(size) {

  const self = { tags: [] }

  self.run = function() {
    if (!size) return

    console.info(`Speed with ${size} runs`)
    var total = 0

    self.tags.forEach(function(tag) {
      const start = Date.now(),
        fn = tag.bench || tag.update,
        name = tag.name,
        spaces = ' '.repeat(20 - name.length)

      for (var i = 0; i < size; i++) fn()
      const time = Date.now() - start
      console.info(`   ${ name }${spaces} ${ time }ms`)
      total += time
    })

    console.info(`\nTotal ${ total }ms`)
  }

  return self

}