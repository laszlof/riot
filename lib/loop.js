
// A mapping of items and corresponding dom nodes
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

