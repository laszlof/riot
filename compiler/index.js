
// libs
const scopedCSS = require('./lib/scoped-css'),
  parsers = require('./lib/parsers'),
  Tag = require('./lib/tag'),
  dom = require('./lib/dom')

// RE
const LT = /<([^[a-z\/])/g

function escape(html) {
  return html.replace(LT, '&lt;$1')
}

function unescape(js) {
  return js.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}

function unindent(src) {
  const indent = src.replace('\n', '').match(/^\s+/)
  return (indent ? src.replace(RegExp('^' + indent[0], 'gm'), '') : src).trim()
}

function getBlocks(tag_name, root, opts) {

  var removables = [],
    script = '',
    style = '',
    scoped

  function setType(type, value) {
    if (value) {
      opts[type] = value;
      parsers(opts)
    }
  }

  dom.walk(root, function(el, level) {
    if (el.nodeType == 8) removables.push(el)

    if (el.tagName == 'STYLE') {
      setType('css', el.getAttribute('type'))

      var scope_attr = el.attributes.filter(function(attr) {
        return attr.name == 'scoped'
      })

      if (scope_attr[0]) scoped = true
      style += unindent(dom.html(el))
      removables.push(el)
      return false

    } else if (el.tagName == 'SCRIPT') {
      setType('js', el.getAttribute('type'))
      script += dom.html(el)
      removables.push(el)
      return false
    }
  })

  removables.forEach(function(el) {
    el.parentNode.removeChild(el)
  })

  var css = opts.css ? opts.css(style) : style

  return {
    style: scoped ? scopedCSS(tag_name, css) : css,
    script: opts.js(unescape(script.trim()))
  }

}


module.exports = function(src, opts, debug) {
  opts = parsers(opts)

  const html = escape(opts.html(unindent(src))),
    doc = dom.parse(html.trim())

  var ret = '', index = 0, node

  while (node = doc.childNodes.item(index++)) {
    var tag_name = (node.tagName || '').toLowerCase()

    // script outside tag definitions
    if (tag_name == 'script') {
      ret += dom.html(node)

    } else if (tag_name) {
      var root = dom.create('div')
      root.appendChild(node)
      const tag = new Tag(tag_name, root, getBlocks(tag_name, root, opts), opts)
      if (debug) return tag.generate(true)
      ret += tag.generate()
    }
  }

  return ret
}

