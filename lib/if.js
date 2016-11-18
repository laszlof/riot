
// makes a root node mountable
function IF(node, blocks, args, test) {

  // invisible marker node
  var stub = insertBefore(node, emptyNode())

  this.update = function() {
    return test() ? mount() : unmount()
  }

  function unmount() {
    blocks.remove(node)
    removeNode(node)
  }

  function mount() {
    insertBefore(stub, node)
    blocks.add(node, args)
  }

}