
/* Helper for testing a single tag  */
const dom = require('../../compiler/lib/dom'),
  requireTag = require('./require-tag'),
  riot = require('./node-riot')

function $(el) {
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
    el.dispatchEvent({ type: name })
  }

  return el
}

function find(root, name) {
  var ret
  dom.walk(root, function(el) {
    if (ret) return false
    if (el.tagName == name.toUpperCase()) ret = el
  })
  return ret && $(ret)
}

function findAll(root, name) {
  var ret = []
  dom.walk(root, function(el) {
    if (el.tagName == name.toUpperCase()) ret.push($(el))
  })
  return ret
}

module.exports = function(benchmark, tags) {

  return function(html, data, debug) {

    const tag_name = html.trim().split(/[ >]/)[0].slice(1),
      def = requireTag(html),
      tag = riot.mount(tag_name, dom.create('div'), data),
      root = $(tag.root)

    tags.push(def)

    if (debug) {
      console.info(def)
      console.info(root.innerHTML)
    }

    tag.name = tag_name[0].toUpperCase() + tag_name.slice(1).replace(/\-/g, ' ')

    tag.find = function(query) {
      return find(root, query)
    }

    tag.findAll = function(query) {
      return findAll(root, query)
    }

    function trim(str) {
      return str.trim().replace(/\s{2,}/g, ' ').replace(/>\s+</g, '><')
    }

    tag.equals = function(html) {
      var layout = root.innerHTML
      if (trim(layout) != trim(html)) throw layout + '\n\n!=\n\n' + html
    }

    benchmark.tags.push(tag)

    return tag
  }

}


