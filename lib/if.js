
// makes a root node mountable
function IF(node, tag, fn, item) {

  // invisible marker node
  var stub = insertBefore(node, document.createTextNode('')),
    parent = node.parentNode,
    mounted

  this.update = function() {
    return fn.call(tag, item) ? mount() : unmount()
  }

  function unmount() {
    parent && parent.removeChild(node)
  }

  function mount() {
    !mounted && tag.addBlock(node, item)
    insertBefore(stub, node)
  }

}