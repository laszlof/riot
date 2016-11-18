
// window.riot
var riot = window.riot = {},
  all_tags = [],
  defs = {}

// register
riot.tag = function(name, html, fns, impl) {
  defs[name] = [html, fns, impl]
}

// mount
riot.mount = function(name, to, opts) {
  var tag = new Tag(name, to, opts)
  all_tags.push(tag)
  return tag.update()
}

// update all
riot.update = function() {
  each(all_tags, function(tag) {
    tag.update()
  })
}



