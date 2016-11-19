
// libs
const binded = require('./bind'),
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
    var name = (node.tagName || '').toLowerCase()

    if (name == 'script') {
      ret += dom.html(node)

    } else if (name) {
      var root = dom.create('div')
      root.appendChild(node)
      const tag = new Tag(name, root, getScript(root))
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


function getScript(root) {

  var comments = [],
    script = ''

  dom.walk(root, function(el, level) {
    if (el.nodeType == 8) comments.push(el)
    else if (el.tagName == 'SCRIPT') {
      if (!script && level == 1) script = dom.html(el)
      comments.push(el)
      return false
    }
  })

  comments.forEach(function(el) {
    el.parentNode.removeChild(el)
  })

  return binded(unescape(script.trim()))
}
