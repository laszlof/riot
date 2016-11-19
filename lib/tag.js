
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


  // for private use only
  var _tag = {

    fns: def[1],

    addBlock: function(node, args) {
      var block = new Block(node, self, _tag, args)
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
      _tag.addChild(name, el, refs)
    }

  }

  _tag.addBlock(root, [])

  // init
  var impl = def[2]
  impl && impl.call(self, self, opts)


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
