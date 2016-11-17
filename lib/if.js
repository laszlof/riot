
// makes a root node mountable
function IF(node, tag, fn, item) {

  // invisible marker node
  var stub = insertBefore(node, emptyNode()),
    mounted

  this.update = function() {
    return fn.call(tag, item) ? mount() : removeNode(node)
  }

  function mount() {
    !mounted && tag.addBlock(node, item)
    mounted = insertBefore(stub, node)
  }

}