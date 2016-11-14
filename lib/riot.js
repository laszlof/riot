
// The globals
var riot = window.riot = {}

var tags = {}

// register
riot.tag = function(name, html, fns, impl) {
  tags[name] = [html, fns, impl]
}

// mount
riot.mount = function(name, to, opts) {
  var tag = tags[name]
  if (tag) {
    var impl = new Tag(name, tag[0], tag[1], tag[2], opts)
    return impl.mount(to)
  }
}



