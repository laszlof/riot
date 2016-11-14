
// Custom tag

function Tag(tag_name, html, fns, impl, opts) {

  this.opts = opts = opts || {}

  var self = this,
    root,
    expr

  function exec(expr) {
    each(expr, function(fn) { fn(self) })
  }

  // add new nodes (from loop) and parse their expressions
  function pushNode(node) {
    var name = getTagName(node)
    if (isCustom(name)) riot.mount(name, node)
    else {
      var new_expr = getExpressions(self, node, fns)
      expr = expr.concat(new_expr)
      exec(new_expr)
    }
  }

  // Get initial expressions and if / each clauses
  function parseDom() {

    impl && impl.call(self, self, opts)

    root = self.root = mkdom(html)

    var loops = []

    walk(root, function(node) {
      var name = getTagName(node)
      if (!name) return

      attr = remAttr(node, 'each')
      if (attr) loops.push([attr, node])

      var attr = remAttr(node, 'if')
      if (attr) IF(attr, node, self, fns)

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

  // mount
  this.mount = function(to) {

    // the first time
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


  this.unmount = function() {
    var stub = root.unmount()
    if (stub) stub.__tag = self
  }


  this.update = function(data) {
    if (data) extend(self, data)

    // expressions
    exec(expr)

    // nodes to be mounted / unmounted
    var mountables = []

    // walk trough nodes and update them
    walk(root, function(node) {
      if (node == root) return

      var name = getTagName(node),
        is_custom = isCustom(name),
        tag = node.__tag

      // conditional
      if (node.test) {
        var flag = node.test()
        var el = tag || !is_custom && node
        el && mountables.push(flag ? el.mount : el.unmount)
        if (!flag) return false
      }

      // custom tag
      if (tag) tag.update()
      else if (is_custom) riot.mount(name, node)

    })

    // mount / unmount
    each(mountables, function(fn) { fn() })

    return self
  }

}