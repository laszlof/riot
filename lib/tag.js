
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

    // nodes to be mounted / unmounted
    var mountables = []

    // walk trough nodes and update them
    walk(root, function(node) {
      if (node == root) return

      var name = getTagName(node),
        is_custom = isCustom(name),
        tag = node.__tag

      // conditional
      if (node.test) {
        var flag = node.test()
        var el = tag || !is_custom && node
        el && mountables.push(flag ? el.mount : el.unmount)
        if (!flag) return false
      }

      // custom tag
      if (tag) tag.update()
      else if (is_custom) riot.mount(name, node)

    })

    // mount / unmount
    each(mountables, function(fn) { fn() })

    */

    return self
  }

}