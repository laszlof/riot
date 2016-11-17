!function() {

/* Container for loops, custom tags and conditionals */

function Block(tag, fns, root, item) {

  var ifs = [],
    loops = [],
    tags = [],
    expr = []

  this.update = function() {
    each(ifs.concat(tags).concat(loops), function(el) {
      el.update()
    })

    each(expr, function(fn) {
      fn.call(tag, item)
    })

  }

  // extract dynamic parts for later execution
  walk(root, function(node) {

    // if
    attr = remAttr(node, 'if')
    var cond = getFunction(attr)
    if (cond) { ifs.push(new IF(node, tag, cond, item)); return false }

    // each
    var attr = remAttr(node, 'each'), query = getFunction(attr)
    if (query) { loops.push([query, node]); return false }

    // custom tag
    var name = getTagName(node)

    if (node != tag.root && isCustom(name)) {
      tags.push(riot.mount(name, node, item))
      return false
    }

    // body
    var fn = getFunction(node.nodeValue)

    fn && expr.push(function() {
      var arr = fn.call(tag, item),
        val = toValue(arr)

      if (hasHTML(arr)) node.parentNode.innerHTML = val
      else node.nodeValue = val
    })


    // rest of the attributes
    parseAttributes(node)

  })

  // loops
  loops = loops.map(function(loop) {
    return new Loop(loop[0], loop[1], tag, fns, item)
  })


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
      var fn = getter.call(tag, e, item)

      if (fn) {
        var ret = fn.call(tag, e, item)
        tag.update()
        return ret
      }
    })
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
          var val = fn.call(tag, item)
          attr.value = toValue(val)
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
  return name && !!tags[name.toLowerCase()]
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

// returns node attributes as object
function attr(root) {
  var data = {}
  each(root.attributes, function(attr) {
    data[attr.name] = attr.value
  })
  return data
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
  for (var i = 0, el; (el = arr[i]); i++) {
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
function IF(node, tag, fn, item) {

  // invisible marker node
  var stub = insertBefore(node, document.createTextNode('')),
    mounted

  this.update = function() {
    return fn.call(tag, item) ? mount() : removeNode(node)
  }

  function mount() {
    !mounted && tag.addBlock(node, item)
    mounted = insertBefore(stub, node)
  }

}
// A mapping of items and corresponding dom nodes
function Loop(query, node, tag, fns, item) {

  var items = query.call(tag, item)

  // insert hidden start node as marker
  var last = node.previousSibling,
    start = insertBefore(last, document.createTextNode('')),
    nodes = []


  function changeItems(arr) {
    items.splice(0, items.length)
    each(arr, append)
    items = syncable(arr)
  }

  this.update = function() {
    var arr = query.call(tag, item)
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
    tag.addBlock(node, obj)
  }

  function prepend(obj) {
    var node = add(obj, start.nextSibling)
    nodes.unshift(node)
    tag.addBlock(node, obj)
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


// The globals
var riot = window.riot = {}

var tags = {}

// register
riot.tag = function(name, html, fns, impl) {
  tags[name] = [html, fns, impl]
}

// mount
riot.mount = function(name, to, opts) {
  var def = tags[name]

  if (def) {
    var tag = new Tag(name, def[0], def[1], def[2], opts)
    return tag.mount(to)
  }
}




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
        moveChildren(root, to)
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

}}()
