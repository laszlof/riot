
// TODO: move to compiler (riot.require())
var compiler = require('../..')(),
  riot = require('./node-riot')

function requireString(src) {
  const Module = module.constructor,
    m = new Module()
  m._compile(src, '')
  return m.exports
}

module.exports = function(html) {
  const def = compiler.compile(html)
  requireString(`module.exports = function(riot) { ${def} }`)(riot)
  return def
}