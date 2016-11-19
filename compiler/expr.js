

const RESERVED = 'arguments console document false function instanceof location null self this top true typeof undefined window'.split(' '),
  VAR_NAME = /(^|[\-\+\!\s\(])+([a-z]\w*)\b\s?/g,
  EXPR = /\{([^}]+)\}\}?/g

function trimArgs(arr) {
  return arr.filter(function(el) {
    return !!el
  }).join(',')
}


function setThis(expr, args) {
  args = args ? args.split(',') : []
  return expr.replace(VAR_NAME, function(match, beg, key) {
    if (RESERVED.includes(key) || args.includes(key)) return match
    return beg + 'this.' + key.trimLeft()
  })
}

function objectify(str, args) {
  return '{' + str.split(',').map(function(pair) {
    var els = pair.split(':')
    return els[0] + ':' + setThis(els[1], args)

  }).join(',') + '}'
}

// Foo { bar } baz --> ["foo ", this.bar, " baz"]
function toArray(text, args) {
  return text.split(EXPR).map(function(el, i) {
    if (i % 2) {
      return el[0] == '{' ? `{ _html: ${ setThis(el.slice(1), args) } }` :
        /\w+:/.test(el.trim()) ? objectify(el, args) :
        setThis(el, args)
    }
    return '"' + el + '"'

  }).filter(function(el) {
    return el != '""'
  })
  return ret
}

module.exports = function(expr, args_arr) {
  var args = trimArgs(args_arr),
    arr = toArray(expr, args),
    body = arr.length > 1 ? '[' + arr + ']' : arr[0].trim()

  return `function(${args}){return ${body}}`
}
