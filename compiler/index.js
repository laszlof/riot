
// libs
const parseJS = require('./js-parse'),
  util = require('util'),
  dom = require('./dom')

// RE
const RESERVED = 'document false function instanceof location null opts self this top true typeof undefined window'.split(' '),
  ATTR_EXPR = /([\w\-]+=)(\{[^}]+\})([\s>])/g,
  VAR_NAME = /(^|[\!\s\(])+([a-z]\w*)\b\s?/gi,
  TAG = /<(\w+-?\w+)([^>]*)>/g,
  EXPR = /\{([^}]+)\}/g



function setThis(expr, args) {
  args = args ? args.split(/\s*,\s*/) : []
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
      return /\w+:/.test(el.trim()) ? objectify(el, args) : setThis(el, args)
    }
    return '"' + el + '"'

  }).filter(function(el) {
    return el != '""'
  })
  return ret
}

function makeFn(expr, args) {
  var arr = toArray(expr, args),
    body = arr.length > 1 ? '[' + arr + ']' : arr[0].trim()

  return `function(${args}){return ${body}}`
}

function isExpr(str) {
  return str && str[0] == '{' && str.endsWith('}')
}

function closeTags(html) {
  return html.replace(TAG, function(match, name, attr) {
    return match.replace('/>', '></' + name + '>')
  })
}

// foo={ bar } --> foo="{ bar }"
function quoteExpressions(html) {
  return html.replace(ATTR_EXPR, function(match, beg, expr, end) {
    return beg + '"' + expr.replace(/"/g, "'") + '"' + end
  })
}


function getRaw(text) {
  if (text && text.slice(0, 2) == '{{' && text.slice(-2) == '}}') {
    return `{ _html: ${text.slice(2, -2).trim()} }`
  }
}


function closest(arr, index) {
  for (var i = index -1, el; i > 0; i--) {
    el = arr[i]
    if (el) return el
  }
}

function getScript(root) {
  var redundant = [],
    script = ''

  dom.walk(root, function(el, level) {
    if (el.nodeType == 8) redundant.push(el)
    else if (el.tagName == 'SCRIPT') {
      if (!script && level == 1) script = dom.html(el)
      redundant.push(el)
      return false
    }
  })

  redundant.forEach(function(el) {
    el.parentNode.removeChild(el)
  })

  return parseJS(script.trim())
}

function Tag(root, script) {

  const fn_index = {},
    loop_args = [],
    fns = []

  function pushFn(expr, args) {
    if (!expr || !expr.includes('{') || !expr.includes('}')) return

    var fn = makeFn(expr, args),
      i = fn_index[fn]

    if (i === undefined) {
      fns.push(fn);
      i = fn_index[fn] = (fns.length - 1)
    }
    return i
  }


  function setEventHandler(attr, val, args) {
    if (!isExpr(val) || !val.includes('(') || !attr.name.slice(0, 2).toLowerCase() == 'on') return

    // toggle('active') --> this.toggle('active', e, thread, i)
    args = 'e' + (args ? ', ' : '') + args
    var body = setThis(val.slice(1, -1).trim(), args).replace(')', ', ' + args + ')')

    fns.push(`function(${args}) { return ${ body } }`)
    attr.value = '$' + (fns.length - 1)

    return true
  }


  function setAttributes(arr, args) {
    arr && arr.forEach(function(attr) {
      var val = attr.value

      if (!setEventHandler(attr, val, args)) {
        var i = pushFn(val, args)
        if (i >= 0) attr.value = '$' + i
      }
    })
  }


  // { thread, i in threads.slice(1) } -> { item: 'thread', index: 'i', fn: threads.slice(1) }
  function parseEach(el, args) {
    const str = el.tagName && el.getAttribute('each')
    if (isExpr(str)) {
      const els = str.slice(1, -1).trim().split(/\s+in\s+/)
      el.setAttribute('each', '$' + pushFn('{ ' + els[1] + ' }', args))
      // el.setAttribute('args', els[0])
      return els[0]
    }
  }

  function makeHTML() {
    dom.walk(root, function(el, level) {

      // each attribute
      var args = closest(loop_args, level) || '',
        each_args = parseEach(el, args)
      if (each_args) args = loop_args[level] = each_args

      // other attributes
      setAttributes(el.attributes, args)

      var text = el.nodeValue && el.nodeValue.trim()

      // {{ unescaped }}
      const raw = getRaw(text)
      if (raw) text = raw

      const i = pushFn(text, args)
      if (i >= 0) el.nodeValue = '$' + i

    })

    return dom.html(root)
  }

  this.generate = function() {
    var html = makeHTML()

    // console.info(html)
    // console.info(fns)

    return util.format("riot.tag('%s', '%s',\n\n[%s],\n\nfunction(self, opts) {\n\t%s\n})",
      root.firstChild.tagName.toLowerCase(),
      html.replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim(),
      fns.join(',\n'),
      script
    )

  }

}

module.exports = function(html) {
  html = quoteExpressions(closeTags(html))

  const root = dom.parse(html.trim()),
    script = getScript(root),
    tag = new Tag(root, script)

  return tag.generate()
}
