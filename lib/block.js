
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
      var val = fn.call(tag, item)
      if (val && val._html) node.parentNode.innerHTML = val._html
      else node.nodeValue = toValue(val)
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