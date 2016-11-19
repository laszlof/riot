
// makes a root node mountable
function IF(node, _tag, args, test) {

  node.removeAttribute('if')

  // invisible marker node
  var stub = insertBefore(node, emptyNode())

  this.update = function() {
    return test() ? mount() : unmount()
  }

  function unmount() {
    _tag.removeBlock(node)
    removeNode(node)
  }

  function mount() {
    insertBefore(stub, node)
    _tag.addBlock(node, args)
  }

}