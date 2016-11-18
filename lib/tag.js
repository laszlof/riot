
// Custom tag

function Tag(tag_name, to, opts) {

  // tag found?
  var def = defs[tag_name]
  if (!def) throw 'No such tag ' + tag_name

  var root = this.root = mkdom(def[0]),
    self = this,
    blocks = []


  this.addBlock = function(node, items) {
    var block = new Block(self, def[1], node, items)
    blocks.push(block)
  }

  // init
  this.opts = opts
  var impl = def[2]
  impl && impl.call(self, self, opts)
  self.addBlock(root, [])


  // mount
  if (to) {

    // move to new parent
    if (getTagName(to) == tag_name) {
      // copyAttributes(root, to)
      moveChildren(root, to)
      root.changed = to
      root = to

    // replace node
    } else {
      // copyAttributes(root, to)
      to.parentNode.replaceChild(root, to)
    }

  }


  // 3. update x N
  this.update = function(data) {
    if (data) extend(self, data)

    each(blocks, function(block) {
      block.update()
    })

    return self
  }

}