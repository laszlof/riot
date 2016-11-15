
// Custom tag

function Tag(tag_name, html, fns, impl, opts) {

  this.opts = opts = opts || {}

  var self = this,
    blocks = [],
    root


  this.addBlock = function(node, item) {
    var block = new Block(self, fns, node, item)
    blocks.push(block)
  }

  // mount
  this.mount = function(to) {

    // first time
    if (!root) {
      root = self.root = mkdom(html)
      impl && impl.call(self, self, opts)
      self.addBlock(root, opts)
    }

    // already mounted & conditional
    if (!to) return root.mount()

    extend(opts, attr(to))

    // insert to DOM
    var to_name = to.tagName.toLowerCase()

    if (to_name == tag_name) {
      each(root.childNodes, function(node) {
        to.appendChild(node)
      })
      root = to

    } else {
      to.parentNode.replaceChild(root, to)
    }

    to.__tag = self

    return self.update()
  }


  this.unmount = function() {
    var stub = root.unmount()
    if (stub) stub.__tag = self
  }


  this.update = function(data) {
    if (data) extend(self, data)

    // execute blocks
    each(blocks, function(block) {
      block.update()
    })

    /*

    // walk trough nodes and update them
    walk(root, function(node) {
      if (node == root) return

      var name = getTagName(node),
        is_custom = isCustom(name),
        tag = node.__tag

      // custom tag
      if (tag) tag.update()
      else if (is_custom) riot.mount(name, node)

    })

    */

    return self
  }

}