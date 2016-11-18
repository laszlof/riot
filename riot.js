!function() {

/* Container for loops, custom tags and conditionals */

function Block(tag, fns, root, addBlock, args) {

  var ifs = [],
    loops = [],
    tags = [],
    expr = []


  // extract dynamic parts for later execution
  walk(root, function(node) {

    // if
    var attr = remAttr(node, 'if')
    var cond = getFunction(attr)
    if (cond) { ifs.push(new IF(node, tag, cond, addBlock, args)); return false }

    // each
    attr = remAttr(node, 'each'), query = getFunction(attr)
    if (query) { loops.push([query, node]); return false }

    // custom tag
    var name = getTagName(node)
    if (node != tag.root && isCustom(name)) {
      tags.push(new Tag(name, node, getOpts(node))); return false
    }

    // body expression
    var fn = getFunction(node.nodeValue)

    fn && expr.push(function() {
      var arr = fn.apply(tag, args),
        val = toValue(arr)

      if (hasHTML(arr)) {
        var parent = node.parent || node.parentNode
        parent.innerHTML = val
        node.parent = parent
      }
      else node.nodeValue = val
    })

    // attribute expressions
    parseAttributes(node)

  })

  // loops must be constructed after walk()
  loops = loops.map(function(arr) {
    return new Loop(arr[0], arr[1], tag, fns, addBlock, args)
  })


  this.update = function() {
    each(ifs.concat(tags).concat(loops), function(el) {
      el.update()
    })

    each(expr, function(fn) {
      fn.apply(tag, args)
    })

  }


  /** private **/


  // maps and expression ("$1") to a real function() {}
  function getFunction(str) {
    if (str) {
      str = str.trim()
      var i = 1 * str.slice(1)
      if (str[0] == '$' && i >= 0) return fns[i]
    }
  }


  function setEventHandler(node, name, getter) {
    node.removeAttribute(name)

    node.addEventListener(name.slice(2), function(e) {
      var e_args = [e].concat(args),
        fn = getter.apply(tag, e_args)

      if (fn) {
        var ret = fn.apply(tag, e_args)
        tag.update()
        return ret
      }
    })
  }


  function getOpts(node) {
    var opts = {}, rems = []

    each(node.attributes, function(attr) {
      var fn = getFunction(attr.value)
      opts[attr.name] = fn ? fn.apply(tag, args) : attr.value
      fn && rems.push(attr.name)
    })

    each(rems, function(name) {
      node.removeAttribute(name)
    })

    return opts
  }


  function parseAttributes(node) {

    each(node.attributes, function(attr) {
      var fn = getFunction(attr.value)
      if (!fn) return
      attr.value = ''

      var name = attr.name

      // event handler
      if (name.slice(0, 2) == 'on') {
        setEventHandler(node, name, fn)

      } else {
        expr.push(function() {
          var val = fn.apply(tag, args),
            el = node.changed || node

          val === false ? el.removeAttribute(name) : el.setAttribute(name, toValue(val))
        })
      }

    })
  }

}
/* utility functions (not related to tags and blocks) */


// allows looping DOM collections
function each(arr, fn) {
  if (arr) {
    for (var i = 0; i < arr.length; i++) {
      fn(arr[i], i)
    }
  }
}

function emptyNode() {
  return document.createTextNode('')
}

function insertBefore(node, new_node) {
  node.parentNode.insertBefore(new_node, node)
  return new_node
}

function removeNode(node) {
  var parent = node.parentNode
  parent && parent.removeChild(node)
}

function moveChildren(from, to) {
  while (from.childNodes[0]) to.appendChild(from.firstChild)
}

function copyAttributes(from, to) {
  each(from.attributes, function(attr) {
    to.setAttribute(attr.name, attr.value)
  })
}

// get and remove attribute.
function remAttr(node, name) {
  var attr = node.tagName && node.getAttribute(name)
  if (attr) {
    node.removeAttribute(name)
    return attr
  }
}

function getTagName(node) {
  var name = node.tagName
  return name && name.toLowerCase()
}

function isCustom(name) {
  return name && !!defs[name.toLowerCase()]
}

function extend(obj, from) {
  each(Object.keys(from), function(key) {
    obj[key] = from[key]
  })
  return obj
}

function mkdom(html) {
  var el = document.createElement('template')
  el.innerHTML = html.trim()
  return (el.content || el).firstChild
}

// walk trough a DOM tree
function walk(dom, fn) {

  if (fn(dom) === false) return

  dom = dom.firstChild

  while (dom) {
    if (walk(dom, fn) === false) return
    dom = dom.nextSibling
  }
}


// { foo: true, bar: true } --> "foo bar"
function objToString(obj) {
  var ret = []
  for (var key in obj) {
    var val = obj[key]
    if (val) ret.push(key == '_html' ? val : key)
  }
  return ret.join(' ')
}

function hasHTML(arr) {
  for (var i = 0, el; (el = (arr || [])[i]); i++) {
    if (el._html) return true
  }
}

// ['When', this.country, { fails: fail }] --> 'When Finland fails'
function toValue(val) {
  return Array.isArray(val) ? val.map(toValue).join('') :
    val == null ? '' :
    typeof val == 'object' ? objToString(val) :
    val
}







// makes a root node mountable
function IF(node, tag, fn, addBlock, args) {

  // invisible marker node
  var stub = insertBefore(node, emptyNode()),
    mounted

  this.update = function() {
    return fn.apply(tag, args) ? mount() : removeNode(node)
  }

  function mount() {
    !mounted && addBlock(node, args)
    mounted = insertBefore(stub, node)
  }

}
// A mapping of items and corresponding dom nodes
function Loop(query, node, tag, fns, addBlock, args) {

  var items = query.apply(tag, args)

  // insert hidden start node as marker
  var last = node.previousSibling

  if (!last) {
    last = emptyNode()
    node.parentNode.appendChild(last)
  }

  var start = insertBefore(last, emptyNode()),
    nodes = []

  function changeItems(arr) {
    items.splice(0, items.length)
    each(arr, append)
    items = syncable(arr)
  }

  this.update = function() {
    var arr = query.apply(tag, args)
    if (arr != items) changeItems(arr)
  }

  function add(obj, sibling) {
    var el = node.cloneNode(true)
    insertBefore(sibling, el)
    return el
  }

  function append(obj, i) {
    var node = add(obj, last)
    nodes.push(node)
    addBlock(node, args.concat([obj]))
  }

  function prepend(obj) {
    var node = add(obj, start.nextSibling)
    nodes.unshift(node)
    addBlock(node, args.concat([obj]))
  }

  function syncable(items) {

    // push
    var _push = items.push

    items.push = function(obj) {
      _push.call(items, obj)
      append(obj)
      tag.update()
    }

    // unshift
    var _unshift = items.unshift

    items.unshift = function(obj) {
      _unshift.call(items, obj)
      prepend(obj)
      tag.update()
    }

    // splice
    var _splice = items.splice

    items.splice = function(i, len) {
      each(nodes.slice(i, i + len), removeNode)
      nodes.splice(i, len)
      _splice.call(items, i, len)
    }

    // remove() shortcut. commonly used
    items.remove = function(obj) {
      var i = items.indexOf(obj)
      if (i >= 0) return items.splice(i, 1)
    }

    // sort
    var _sort = items.sort

    items.sort = function(fn) {

      // remove nodes
      each(nodes, removeNode)
      nodes = []

      // insert new ones
      _sort.call(items, fn)
      each(items, append)

      tag.update()
    }

    return items

  }

  removeNode(node)

  if (items) {
    syncable(items)
    each(items, append)
  }

}


// window.riot
var riot = window.riot = {},
  all_tags = [],
  defs = {}

// register
riot.tag = function(name, html, fns, impl) {
  defs[name] = [html, fns, impl]
}

// mount
riot.mount = function(name, to, opts) {
  var tag = new Tag(name, to, opts)
  all_tags.push(tag)
  return tag.update()
}

// update all
riot.update = function() {
  each(all_tags, function(tag) {
    tag.update()
  })
}




// Custom tag

function Tag(tag_name, to, opts) {

  // tag found?
  var def = defs[tag_name]
  if (!def) throw 'No such tag ' + tag_name

  var root = this.root = mkdom(def[0]),
    self = this,
    blocks = []


  function addBlock(node, args) {
    var block = new Block(self, def[1], node, addBlock, args)
    blocks.push(block)
  }

  // init
  this.opts = opts
  var impl = def[2]
  impl && impl.call(self, self, opts)
  addBlock(root, [])


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
}()
