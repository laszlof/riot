
// Custom tag

function Tag(tag_name, to, opts, parent) {

  // tag found?
  var def = defs[tag_name]
  if (!def) throw 'No such tag ' + tag_name

  extend(this, { opts: opts, parent: parent })

  var root = this.root = mkdom(def[0]),
    tags = this.tags = {},
    refs = this.refs = {},
    self = this,
    blocks = []


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

  // for private use only
  var private = self.__ = {

    fns: def[1],

    addBlock: function(node, args) {
      var block = new Block(node, self, args)
      blocks.push(block)
      return block
    },

    removeBlock: function(root) {
      each(blocks, function(block, i) {
        if (block.root == root) blocks.splice(i, 1)
      })
    },

    addChild: function(name, tag, obj) {
      obj = obj || tags

      var els = obj[name]
      if (Array.isArray(els)) els.push(tag)
      else obj[name] = els ? [els, tag] : tag
    },

    addRef: function(name, el) {
      private.addChild(name, el, refs)
    }

  }

  private.addBlock(root, [])

  // init
  var impl = def[2]
  impl && impl.call(self, self, opts)

  // mount
  if (to) {

    // move to new parent
    if (getTagName(to) == tag_name) {
      moveChildren(root, to)
      root.changed = to
      root = to

    // replace node
    } else {
      to.parentNode.replaceChild(root, to)
    }

  }


}
