
const ATTR_EXPR = /([\w\-]+=)(\{[^}]+\})([\s>])/g,
  TAG = /<(\w+-?\w+)([^>]*)>/g

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

module.exports = function(str) {
  return quoteExpressions(closeTags(str))
}