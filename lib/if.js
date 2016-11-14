
// makes a root node mountable
function IF(cond, root, tag, fns) {
  var stub

  root.test = function() {
    var fn = getFunction(cond, fns)
    return fn && fn.call(tag)
  }

  root.unmount = function() {
    var parent = root.parentNode

    if (parent) {
      stub = document.createTextNode('')
      parent.replaceChild(stub, root)
      stub.unmount = root.unmount
      stub.mount = root.mount
      stub.test = root.test
      return stub
    }
  }

  root.mount = function() {
    if (stub) {
      var parent = stub.parentNode
      parent && parent.replaceChild(root, stub)
    }
  }

}