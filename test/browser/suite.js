
var bench = benchmark(50),
  suite = []

function assert(el) {
  if (!el) throw el + '== false'
}

assert.equal = function(a, b) {
  if (a != b) throw a + '!=' + b
}

assert.strictEqual = function(a, b) {
  if (a !== b) throw a + '!=' + b
}

assert.throws = function(fn) {
  try {
    fn()
    throw 'must throw'
  } catch(e) {}
}

function $(el) {
  if (!el) return null

  el.text = function() {
    var node = el.firstChild, str = ''

    do {
      str += node.nodeValue
    } while(node = node.nextSibling)

    return str.trim()
  }

  el.attr = function(name) {
    return el.getAttribute(name)
  }

  el.trigger = function(name) {
    var e = new Event(name)
    el.dispatchEvent(e)
  }

  return el
}



function test(tag_name, opts) {
  document.createElement(tag_name)

  var tag = riot.mount(tag_name, null, opts),
    root = tag.root

  tag.name = tag_name[0].toUpperCase() + tag_name.slice(1).replace(/\-/g, ' ')

  tag.find = function(query) {
    return $(root.parentNode.querySelector(query))
  }

  tag.findAll = function(query) {
    return [].map.call(root.querySelectorAll(query), $)
  }

  function trim(str) {
    return str.trim().replace(/\s{2,}/g, ' ').replace(/>\s+</g, '><')
  }

  tag.equals = function(html) {
    var layout = root.innerHTML
    if (trim(layout) != trim(html)) throw layout + '\n\n!=\n\n' + html
  }

  bench.tags.push(tag)

  return tag
}

suite.run = function() {
  var start = Date.now()
  suite.forEach(function(fn) {
    fn(test, assert)
  })
  var title = 'All passed in ' + (Date.now() - start) + 'ms\n'
  document.title = title
  console.info(title)

  bench.run()
}
