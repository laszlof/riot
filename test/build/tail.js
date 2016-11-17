
const parser = new SDOM.HTMLParser(Tokenizer.tokenize, document, SDOM.voidMap)

function mkdom(html) {
  return parser.parse(html).firstChild
}

module.exports = {
  mount: riot.mount
}