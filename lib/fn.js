
/* utility functions (not related to tags and blocks) */


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
self.walk = function(dom, fn) {

  if (fn(dom) === false) return

  dom = dom.firstChild

  while (dom) {
    if (self.walk(dom, fn) === false) return
    dom = dom.nextSibling
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






