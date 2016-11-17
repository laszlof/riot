
// https://github.com/riot/compiler/blob/master/src/core.js#L410

const JS_ES6SIGN = /^[ \t]*([$_A-Za-z][$\w]*)\s*\([^()]*\)\s*{/m,
  JS_COMMS = /\/\/ [^\r\n]*/g


const RE = RegExp

// Remove comments without touching qblocks
function rmComms(s, r, m) {
  r.lastIndex = 0
  while ((m = r.exec(s))) {
    if (m[0][0] === '/' && !m[1] && !m[2]) {    // $1:div, $2:regex
      s = RE.leftContext + ' ' + RE.rightContext
      r.lastIndex = m[3] + 1                    // $3:matchOffset
    }
  }
  return s
}

// Search the closing bracket with regex.exec
function skipBody(s, r) {
  var m, i = 1

  r.lastIndex = 0
  while (i && (m = r.exec(s))) {
    if (m[0] === '{') ++i
    else if (m[0] === '}') --i
  }
  return i ? s.length : r.lastIndex
}

module.exports = function(js) {
  var parts = [],   // parsed code
    match,
    toes5,
    pos,
    name

  if (~js.indexOf('/')) js = rmComms(js, JS_COMMS)

  // 2016-01-18: Faster, only replaces the method name, captured in $1
  while ((match = js.match(JS_ES6SIGN))) {
    // save the processed part
    parts.push(RE.leftContext)
    js  = RE.rightContext
    pos = skipBody(js, /[\{\}]/g)

    // convert ES6 method signature to ES5 function, exclude JS keywords
    name  = match[1]
    toes5 = !/^(?:if|while|for|switch|catch|function)$/.test(name)
    name  = toes5 ? match[0].replace(name, 'this.' + name + ' = function') : match[0]
    parts.push(name, js.slice(0, pos))
    js = js.slice(pos)

    // bind to `this` if needed
    if (toes5 && !/^\s*.\s*bind\b/.test(js)) parts.push('.bind(this)')
  }

  return parts.length ? parts.join('') + js : js

}
