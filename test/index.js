

const test = require('./lib/tag-test'),
  assert = require('assert'),
  start = Date.now()


require('./expressions')(test, assert)
require('./conditionals')(test, assert)
require('./loops')(test, assert)


console.info(`All passed in ${Date.now() - start}ms`)


