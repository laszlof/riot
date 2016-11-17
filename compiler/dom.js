
const Tokenizer = require('simple-html-tokenizer'),
  SDOM = require('simple-dom'),
  self = module.exports = {}


function toString(root) {
  const serializer = new SDOM.HTMLSerializer(SDOM.voidMap)
  return serializer.serialize(root)
}

self.create = function(name) {
  var document = new SDOM.Document()
  return document.createElement(name)
}

self.html = function(root) {
  var next = root.firstChild,
    html = ''

  while (next) {
    html += toString(next)
    next = next.nextSibling
  }

  return html
}

self.parse = function(html) {
  const blank = new SDOM.Document()
  const parser = new SDOM.HTMLParser(Tokenizer.tokenize, blank, SDOM.voidMap)
  return parser.parse(html)
}

// walk trough a DOM tree
self.walk = function(dom, fn, level) {
  if (level == null) level = 0

  if (fn(dom, level - 1) === false) return

  dom = dom.firstChild

  if (dom) level++

  while (dom) {
    if (self.walk(dom, fn, level) === false) return
    dom = dom.nextSibling
  }
}
