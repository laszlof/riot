
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
  return indent ? src.replace(RegExp('^' + indent[0], 'gm'), '') : src
}

function getBlocks(tag_name, root, opts) {

  var removables = [],
    script = '',
    style = ''

  dom.walk(root, function(el, level) {
    if (el.nodeType == 8) removables.push(el)

    if (el.tagName == 'STYLE') {
      var scoped = el.attributes.filter(function(attr) { return attr.name == 'scoped' }),
        css = dom.html(el)

      style += scoped[0] ? scopedCSS(tag_name, css) : css
      removables.push(el)
      return false

    } else if (el.tagName == 'SCRIPT') {
      script += dom.html(el)
      removables.push(el)
      return false
    }
  })

  removables.forEach(function(el) {
    el.parentNode.removeChild(el)
  })

  return {
    style: opts.css ? opts.css(unindent(style)) : style,
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

