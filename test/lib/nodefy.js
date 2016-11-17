
/* Makes Riot testable on the server */

const Tokenizer = require('simple-html-tokenizer'),
  dom = require('../../compiler/dom'),
  SDOM = require('simple-dom'),
  document = new SDOM.Document()


// innerHTML
Object.defineProperty(SDOM.Element.prototype, 'innerHTML', {
  set: function(html) {
    var frag = dom.parse(html)
    while (this.firstChild) this.removeChild(this.firstChild)
    this.appendChild(frag)
  }
})

function mkdom(html) {
  return dom.parse(html).firstChild
}

module.exports = riot