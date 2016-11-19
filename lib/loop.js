
// A mapping of array items and corresponding dom nodes

function Loop(query, node, tag, _tag, args) {

  node.removeAttribute('each')

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
    _tag.addBlock(node, args.concat([obj]))
  }

  function prepend(obj) {
    var node = add(obj, start.nextSibling)
    nodes.unshift(node)
    _tag.addBlock(node, args.concat([obj]))
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
      each(nodes.slice(i, i + len), function(node) {
        _tag.removeBlock(node)
        removeNode(node)
      })
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

