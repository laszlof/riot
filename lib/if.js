
// makes a root node mountable
function IF(node, tag, args, test) {

  node.removeAttribute('if')

  // invisible marker node
  var stub = insertBefore(node, emptyNode()),
    t = tag.__

  this.update = function() {
    return test() ? mount() : unmount()
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