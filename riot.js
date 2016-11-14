!function() {

// allows looping DOM collections
function each(arr, fn) {
  if (arr) {
    for (var i = 0; i < arr.length; i++) {
      fn(arr[i], i)
    }
  }
}

// get and remove attribute.
function remAttr(node, name) {
  var attr = node.getAttribute(name)
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
  var el = document.createElement('div')
  el.innerHTML = html.trim()
  return el.firstChild
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
  if (dom) {
    if (fn(dom) === false) return

    dom = dom.firstChild

    while (dom) {
      if (walk(dom, fn) === false) return
      dom = dom.nextSibling
    }
  }
}

// maps and expression ("$1") to a real function() {}
function getFunction(str, fns) {
  if (str) {
    str = str.trim()
    var i = 1 * str.slice(1)
    if (str[0] == '$' && i >= 0) return fns[i]
  }
}

// { foo: true, bar: true } --> "foo bar"
function objToString(obj) {
  var ret = []
  for (var key in obj) {
    if (obj[key]) ret.push(key)
  }
  return ret.join(' ')
}

// ['When', this.country, { fails: fail }] --> 'When Finland fails'
function toValue(val) {
  return Array.isArray(val) ? val.map(toValue).join('') :
    val == null ? '' :
    typeof val == 'object' ? objToString(val) :
    val
}


function getBodyExpr(node, fns) {
  var fn = getFunction(node.nodeValue, fns),
    type = node.nodeType

  return fn && function(tag) {
    var val = fn.call(tag, findItem(node))
    if (val._html) node.parentNode.innerHTML = val._html
    else node.nodeValue = toValue(val)
  }
}


function findItem(node) {
  do {
    var item = node.item
    if (item) return item
  } while(node = node.parentNode)
  return {}
}

function setHandler(tag, node, name, getter) {
  node.removeAttribute(name)

  node.addEventListener(name.slice(2), function(e) {
    var item = findItem(node),
      fn = getter.call(tag, e, item)

    if (fn) {
      var ret = fn.call(tag, e, item)
      tag.update()
      return ret
    }
  })

}


function getExpressions(tag, root, fns) {
  var expr = []

  walk(root, function(node) {

    // body
    var fn = getBodyExpr(node, fns)
    fn && expr.push(fn)

    // attributes
    each(node.attributes, function(attr) {
      var fn = getFunction(attr.value, fns),
        name = attr.name

      // event handler
      if (name.slice(0, 2) == 'on') {
        return setHandler(tag, node, name, fn)
      }

      fn && expr.push(function(tag) {
        var val = fn.call(tag)
        attr.value = toValue(val)
      })
    })

  })

  return expr
}

function IF(cond, root, tag, fns) {
  var stub

  root.test = function() {
    var fn = getFunction(cond, fns)
    return fn && fn.call(tag)
  }

  root.unmount = function() {
    var parent = root.parentNode

    if (parent) {
      stub = document.createTextNode('')
      parent.replaceChild(stub, root)
      stub.unmount = root.unmount
      stub.mount = root.mount
      stub.test = root.test
      return stub
    }
  }

  root.mount = function() {
    if (stub) {
      var parent = stub.parentNode
      parent && parent.replaceChild(root, stub)
    }
  }

}
function Loop(items, node, pushNode) {

  if (!items) return

  var start = document.createTextNode(''),
    last = node.previousSibling,
    nodes = []

  // insert hidden start node as marker
  last.parentNode.insertBefore(start, last)


  function add(obj, sibling) {
    var el = node.cloneNode(true)
    sibling.parentNode.insertBefore(el, sibling)
    el.item = obj
    return el
  }

  function detach(node) {
    node.parentNode.removeChild(node)
  }

  function append(obj, i) {
    var el = add(obj, last)
    nodes.push(el)
    return el
  }

  function prepend(obj) {
    var el = add(obj, start.nextSibling)
    nodes.unshift(el)
    return el
  }


  // push
  var _push = items.push

  items.push = function(obj) {
    _push.call(items, obj)
    pushNode(append(obj))
  }

  // unshift
  var _unshift = items.unshift

  items.unshift = function(obj) {
    _unshift.call(items, obj)
    pushNode(prepend(obj))
  }

  // splice
  var _splice = items.splice

  items.splice = function(i, len) {
    each(nodes.slice(i, i + len), detach)
    nodes.splice(i, len)
    _splice.call(items, i, len)
  }

  // remove() shortcut. commonly used
  items.remove = function(obj) {
    var i = items.indexOf(obj)
    if (i >= 0) return items.splice(i, 1)
  }

  // TODO: sort

  detach(node)

  each(items, append)

}


var riot = window.riot = {}

var tags = {}

// register
riot.tag = function(name, html, fns, impl) {
  tags[name] = [html, fns, impl]
}

// mount
riot.mount = function(name, to, opts) {
  var tag = tags[name]
  if (tag) {
    var impl = new Tag(name, tag[0], tag[1], tag[2], opts)
    return impl.mount(to)
  }
}




function Tag(tag_name, html, fns, impl, opts) {

  this.opts = opts = opts || {}

  var self = this,
    root,
    expr

  function exec(expr) {
    each(expr, function(fn) { fn(self) })
  }

  function pushNode(node) {
    var name = getTagName(node)
    if (isCustom(name)) riot.mount(name, node)
    else {
      var new_expr = getExpressions(self, node, fns)
      expr = expr.concat(new_expr)
      exec(new_expr)
    }
  }

  // if, each
  function parseDom() {

    impl && impl.call(self, self, opts)

    root = self.root = mkdom(html)

    var loops = []

    walk(root, function(node) {
      var name = getTagName(node)
      if (!name) return

      var attr = remAttr(node, 'if')
      if (attr) IF(attr, node, self, fns)

      attr = remAttr(node, 'each')
      if (attr) loops.push([attr, node])

    })

    // loops
    loops = loops.map(function(arg) {
      var query = getFunction(arg[0], fns),
        node = arg[1]
      return new Loop(query.call(self), node, pushNode)
    })

    // expressions
    expr = getExpressions(self, root, fns)

  }


  this.unmount = function() {
    var stub = root.unmount()
    if (stub) stub.__tag = self
  }

  // mount
  this.mount = function(to) {

    // first time
    if (!root) parseDom()

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

  this.update = function(data) {
    if (data) extend(self, data)

    exec(expr)

    var fns = []

    walk(root, function(node) {
      if (node == root) return

      var name = getTagName(node),
        is_custom = isCustom(name),
        tag = node.__tag

      // conditional
      if (node.test) {
        var flag = node.test()
        var el = tag || !is_custom && node
        el && fns.push(flag ? el.mount : el.unmount)
        if (!flag) return false
      }

      // custom tag
      if (tag) tag.update()
      else if (is_custom) riot.mount(name, node)

    })

    // mount / unmount
    each(fns, function(fn) { fn() })

    return self
  }

}}()
