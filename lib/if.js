
// makes a root node mountable
function IF(node, tag, fn, items) {

  // invisible marker node
  var stub = insertBefore(node, emptyNode()),
    mounted

  this.update = function() {
    return fn.apply(tag, items) ? mount() : removeNode(node)
  }

  function mount() {
    !mounted && tag.addBlock(node, items)
    mounted = insertBefore(stub, node)
  }

}