
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

      // insert
      if (getTagName(to) == tag_name) {
        while (root.childNodes[0]) to.appendChild(root.firstChild)
        root = to

      } else {
        to.parentNode.replaceChild(root, to)
      }
    }

    return self.update()
  }

  this.update = function(data) {
    if (data) extend(self, data)

    // execute blocks
    each(blocks, function(block) {
      block.update()
    })

    return self
  }

}