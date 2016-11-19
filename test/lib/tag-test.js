
const dom = require('../../compiler/dom'),
  compile = require('../../compiler'),
  riot = require('./node-riot')


function requireString(src) {
  const Module = module.constructor,
    m = new Module()
  m._compile(src, '')
  return m.exports
}

function importTag(html) {
  const def = `module.exports = function(riot) { ${compile(html)} }`
  requireString(def)(riot)
  return def
}

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

  el.html = function() {
    return dom.html(el)
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

module.exports = function(html, data, debug) {
  const tag_name = html.trim().split(/[ >]/)[0].slice(1),
    def = importTag(html, debug && tag_name),
    tag = riot.mount(tag_name, null, data)

  if (debug) {
    console.info(def)
    console.info(tag.root.innerHTML)
  }

  tag.find = function(query) {
    return find(tag.root, query)
  }

  tag.findAll = function(query) {
    return findAll(tag.root, query)
  }

  return tag
}

