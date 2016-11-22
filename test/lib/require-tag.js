
var compile = require('../../compiler'),
  riot = require('./node-riot')

function requireString(src) {
  const Module = module.constructor,
    m = new Module()
  m._compile(src, '')
  return m.exports
}

module.exports = function(html) {
  const def = compile(html)
  requireString(`module.exports = function(riot) { ${def} }`)(riot)
  return def
}