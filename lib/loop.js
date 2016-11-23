
// A mapping of array items and corresponding dom nodes

function Loop(query, node, tag, args) {

  node.removeAttribute('each')
  args = args || []

  var last = node.previousSibling,
    nodes = [],
    items

  if (!last) {
    last = emptyNode()
    node.parentNode.appendChild(last)
  }

  var start = insertBefore(last, emptyNode())

  removeNode(node)

  this.update = function() {
    var arr = query.apply(tag, args)

    // no change
    if (items == arr) return

    if (Array.isArray(arr)) {
      if (items) items.splice(0, items.length)
      each(arr, append)
      items = arrayLoop(arr)

    } else if (arr && !items) {
      objectLoop(arr)
      items = arr
    }

  }

  // for yielding
  if (node.innerHTML && isCustom(node)) {
    tag.__.tmpl = moveChildren(node, document.createElement('div'))
  }

  function addBlock(node, obj, i) {
    tag.__.addBlock(node, args.concat([obj, i]))
  }

  function add(obj, sibling) {
    var el = node.cloneNode(true)
    insertBefore(sibling, el)
    return el
  }

  function append(obj, i) {
    var node = add(obj, last)
    nodes.push(node)
    addBlock(node, obj, i)
  }

  function prepend(obj, i) {
    var node = add(obj, start.nextSibling)
    nodes.unshift(node)
    addBlock(node, obj, i)
  }


  function objectLoop(obj) {
    Object.keys(obj).forEach(function(key) {
      var val = obj[key]
      append(key, val)
    })
  }

  function arrayLoop(items) {

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
        tag.__.removeBlock(node)
        removeNode(node)
      })
      nodes.splice(i, len)
      _splice.call(items, i, len)
    }

    // remove() shortcut. commonly used
    items.remove = function(obj) {
      var i = items.indexOf(obj)
      if (i >= 0) return items.splice(i, 1)
      return obj
    }

    items.pop = function() {
      var obj = items.slice(-1)[0]
      return items.remove(obj)
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

}

