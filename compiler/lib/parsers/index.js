
const extend = require('util')._extend

const defaults = {
  html: require('./html'),
  js: require('./js')
}

const parsers = {
  es6: function(src) {
    const core = require('babel-core')
    return core.transform(src).code
  },

  pug: function(src) {
    return require('pug').render(src)
  },

  buble: function(src) {
    return require('buble').transform(src).code
  },

  sass: function(src) {
    const opts = {
      indentType: /^\t/gm.test(src) && 'tab',
      outputStyle: 'compact',
      omitSourceMapUrl: true,
      indentedSyntax: true,
      data: src
    }

    return '' + require('node-sass').renderSync(opts).css
  }
}

parsers.jade = parsers.pug


module.exports = function(opts) {
  for (var key in opts) {
    var parser = opts[key]

    if (typeof parser == 'string') {
      parser = parsers[parser]
      if (parser) opts[key] = parser
      else delete opts[key]
    }
  }

  const defs = extend({}, defaults)
  return extend(defs, opts)
}

