
// libs
const scopedCSS = require('./scoped'),
  binded = require('./bind'),
  Tag = require('./tag'),
  dom = require('./dom')

// RE
const ATTR_EXPR = /([\w\-]+=)(\{[^}]+\})([\s>])/g,
  TAG = /<(\w+-?\w+)([^>]*)>/g,
  LT = /<([^[a-z\/])/g


module.exports = function(html) {
  html = quoteExpressions(closeTags(escape(html)))
  const doc = dom.parse(html.trim())

  var ret = '', index = 0, node

  while (node = doc.childNodes.item(index++)) {
    var tag_name = (node.tagName || '').toLowerCase()

    if (tag_name == 'script') {
      ret += dom.html(node)

    } else if (tag_name) {
      var root = dom.create('div')
      root.appendChild(node)
      const tag = new Tag(tag_name, root, getExtras(tag_name, root))
      ret += tag.generate()
    }
  }

  return ret
}

function escape(html) {
  return html.replace(LT, '&lt;$1')
}

function unescape(js) {
  return js.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}

function closeTags(html) {
  return html.replace(TAG, function(match, name, attr) {
    return match.replace('/>', '></' + name + '>')
  })
}

// foo={ bar } --> foo="{ bar }"
function quoteExpressions(html) {
  return html.replace(ATTR_EXPR, function(match, beg, expr, end) {
    return beg + '"' + expr.replace(/"/g, "'") + '"' + end
  })
}


function getExtras(tag_name, root) {

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
    script: binded(unescape(script.trim())),
    style: style
  }

}
