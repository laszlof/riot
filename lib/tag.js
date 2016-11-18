
// Custom tag

function Tag(tag_name, to, opts, parent) {

  // tag found?
  var def = defs[tag_name]
  if (!def) throw 'No such tag ' + tag_name

  var root = this.root = mkdom(def[0]),
    self = this,
    blocks = []


  blocks.add = function(node, args) {
    var block = new Block(self, def[1], node, blocks, args)
    blocks.push(block)
  }

  blocks.remove = function(root) {
    each(blocks, function(block, i) {
      if (block.root == root) blocks.splice(i, 1)
    })
  }


  extend(this, { opts: opts, parent: parent })

  // init
  var impl = def[2]
  impl && impl.call(self, self, opts)
  blocks.add(root, [])


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

  function update(data) {
    if (data) extend(self, data)

    each(blocks, function(block) {
      block.update()
    })

    return self
  }

  Object.defineProperty(self, 'update', {
    get: function() { return update },

    set: function(value) {
      throw 'Cannot set update property'
    }
  })

}
