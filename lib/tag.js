
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
    if (root) return

    root = self.root = mkdom(html)
    impl && impl.call(self, self, opts)
    self.addBlock(root, opts)

    if (to) {
      extend(opts, attr(to))

      // move to new parent
      if (getTagName(to) == tag_name) {
        copyAttributes(root, to)
        moveChildren(root, to)
        root.changed = to
        root = to

      // replace node
      } else {
        copyAttributes(to, root)
        to.parentNode.replaceChild(root, to)
      }
    }

    return self.update()
  }

  // execute blocks
  this.update = function(data) {
    if (data) extend(self, data)

    each(blocks, function(block) {
      block.update()
    })

    return self
  }

}