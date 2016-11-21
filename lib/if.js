
// makes a root node mountable
function IF(node, tag, args, test) {

  node.removeAttribute('if')
  var mounted

  // invisible marker node
  var stub = insertBefore(node, emptyNode()),
    t = tag.__

  this.update = function() {
    var flag = !!test()
    if (flag !== mounted) flag ? mount() : unmount()
    mounted = flag
  }

  function unmount() {
    t.removeBlock(node)
    removeNode(node)
  }

  function mount() {
    insertBefore(stub, node)
    t.addBlock(node, args)
  }

}