#!/usr/bin/env node

'use strict'

// usage
const args = process.argv
if (args.length < 3 || args[2] == '-h') {
  return console.info('\nUSAGE:\n\nriot src/todo.htm [dest]\n\n')
}

var compile = require('..'),
  fs = require('fs'),
  src = args[2],
  html

// read source
try {
  html = fs.readFileSync(src, 'utf-8')

} catch (e) {
  var msg = e.message
  if (msg.startsWith('ENOENT')) msg = 'Cannot find ' + src
  return console.error(msg)
}

// resulting file path
const file = require('path').parse(src),
  dest = (args[3] || file.dir) + '/' + file.name + '.js'

// write
fs.writeFileSync(dest, compile(html))
console.info('wrote', dest)

