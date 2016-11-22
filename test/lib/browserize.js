
/* Makes the test files work under browser */
const tests = ['basics', 'conditionals', 'loops', 'yield'],
  fs = require('fs')

// module.exports --> tests.push()
function browserize(src) {
  return src.replace(/module\.exports = /g, 'suite.push(')

    // remove template strings
    .replace(/`\s*<([\w\-]+)[^`]+`/g, "'$1'") + ')'
}

// browserize all test files
var ret = ''

tests.forEach(function(name) {
  ret += browserize(fs.readFileSync(`test/${ name }.js`, 'utf-8'))
})

ret += '\nsuite.run()'

fs.writeFileSync('test/browser/tests.js', ret)

