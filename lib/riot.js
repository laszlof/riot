
// The globals
var riot = window.riot = {}

var tags = {}

// register
riot.tag = function(name, html, fns, impl) {
  tags[name] = [html, fns, impl]
}

// mount
riot.mount = function(name, to, opts) {
  var def = tags[name]

  if (def) {
    var tag = new Tag(name, def[0], def[1], def[2], opts)
    return tag.mount(to)
  }
}



