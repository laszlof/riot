
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

// returns update function for tags body
function getBodyExpr(node, fns) {
  var fn = getFunction(node.nodeValue, fns),
    type = node.nodeType

  return fn && function(tag) {
    var val = fn.call(tag, findItem(node))
    if (val._html) node.parentNode.innerHTML = val._html
    else node.nodeValue = toValue(val)
  }
}

// finds the data item on a loop
function findItem(node) {
  do {
    var item = node.item
    if (item) return item
  } while(node = node.parentNode)
  return {}
}


function setEventHandler(tag, node, name, getter) {
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

// get's all (initial) expressions for a given tag
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
        return setEventHandler(tag, node, name, fn)
      }

      fn && expr.push(function(tag) {
        var val = fn.call(tag)
        attr.value = toValue(val)
      })
    })

  })

  return expr
}
