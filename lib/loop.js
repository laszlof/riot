
// A mapping of items and corresponding dom nodes
function Loop(query, node, tag, fns, item) {

  var items = query.call(tag, item)

  if (!items) return


  // insert hidden start node as marker
  var last = node.previousSibling,
    start = insertBefore(last, document.createTextNode('')),
    nodes = []


  function add(obj, sibling) {
    var el = node.cloneNode(true)
    insertBefore(sibling, el)
    return el
  }

  function detach(node) {
    node.parentNode.removeChild(node)
    // TODO: cleanup
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


  // push
  var _push = items.push

  items.push = function(obj) {
    _push.call(items, obj)
    append(obj)
  }

  // unshift
  var _unshift = items.unshift

  items.unshift = function(obj) {
    _unshift.call(items, obj)
    prepend(obj)
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

