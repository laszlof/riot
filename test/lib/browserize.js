
const fs = require('fs')

const tests = ['basics', 'conditionals', 'loops', 'yield']

function browserize(src) {
  return src.replace(/module\.exports = /g, 'suite.push(')
    .replace(/`\s*<([\w\-]+)[^`]+`/g, "'$1'") + ')'
}

var ret = ''

tests.forEach(function(name) {
  ret += browserize(fs.readFileSync(`test/${ name }.js`, 'utf-8'))
})

ret += '\nsuite.run()'

fs.writeFileSync('test/browser/tests.js', ret)

