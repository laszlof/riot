
// makes a root node mountable
function IF(node, tag, fn, addBlock, args) {

  // invisible marker node
  var stub = insertBefore(node, emptyNode()),
    mounted

  this.update = function() {
    return fn.apply(tag, args) ? mount() : removeNode(node)
  }

  function mount() {
    !mounted && addBlock(node, args)
    mounted = insertBefore(stub, node)
  }

}