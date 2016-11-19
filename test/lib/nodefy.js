
/* Makes Riot testable on the server */

const Tokenizer = require('simple-html-tokenizer'),
  dom = require('../../compiler/dom'),
  SDOM = require('simple-dom'),
  document = new SDOM.Document(),
  proto = SDOM.Element.prototype


// innerHTML
Object.defineProperty(proto, 'innerHTML', {
  set: function(html) {
    var frag = dom.parse(html)
    while (this.firstChild) this.removeChild(this.firstChild)
    this.appendChild(frag)
  },
  get: function() {
    return dom.html(this)
  }
})

proto.replaceChild = function(new_node, node) {
  insertBefore(node, new_node)
  removeNode(node)
}

// primitive event modeling
proto.addEventListener = function(name, fn) {
  this['on' + name] = fn
}

proto.dispatchEvent = function(event) {
  const fn = this['on' + event.type]
  fn && fn(event)
}

function mkdom(html) {
  return dom.parse(html).firstChild
}

module.exports = riot