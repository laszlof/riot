

const benchmark = require('./lib/benchmark')(1 * process.argv.slice(-1)[0]),
  test = require('./lib/tag-test')(benchmark),
  assert = require('assert'),
  start = Date.now()


require('./basics')(test, assert)
require('./conditionals')(test, assert)
require('./yield')(test, assert)
require('./loops')(test, assert)

console.info(`All tests passed in ${Date.now() - start}ms\n`)

benchmark.run()
